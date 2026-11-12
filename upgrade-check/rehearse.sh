#!/bin/sh
# Rehearses the upgrade from MHIRA 1.1.6 to the new version on a copy of an
# installation's data: restores a backup pair into a throwaway stack, runs
# 1.1.6 on it, then the new version, then 1.1.6 again (the way back), reads
# everything through each, takes the inventory after each, and judges the
# result. The installation itself is not touched. See README.md.
set -eu

here=$(cd "$(dirname "$0")" && pwd)
# The upgrade this check is for: FROM_VERSION and TO_VERSION.
. "$here/versions.sh"

usage() {
    cat >&2 <<EOF
usage: sh rehearse.sh --backups DIR --live FILE [options]

Rehearses the upgrade from MHIRA $FROM_VERSION to $TO_VERSION on a copy of the data.

  --backups DIR      the backup folder (DATA_BACKUP_PATH), holding postgres/
                     and mongo/
  --live FILE        the inventory taken on the installation (README, step 1)
  --name FILE        which backup, e.g. mhira-data-2026-11-12T00:00:00.dump;
                     default: the newest one present in both folders
  --out DIR          where the results go; default
                     ./upgrade-check-<date and time>
  --new-image IMAGE  the backend image to upgrade to; default
                     mhiraproject/mhira-backend:$TO_VERSION
  --keep             leave the throwaway stack running afterwards

  sh rehearse.sh --empty [--out DIR]
                     (maintainer) $FROM_VERSION on empty databases, for the
                     structure reference

Exit code: 0 PASS, 1 CHECK, 2 STOP, 3 the check itself could not run.
EOF
    exit 64
}

backups= name= live= out= keep=no empty=no
current_image=mhiraproject/mhira-backend:$FROM_VERSION
new_image=mhiraproject/mhira-backend:$TO_VERSION
while [ $# -gt 0 ]; do
    case "$1" in
        --backups) backups=${2:?}; shift 2 ;;
        --name) name=${2:?}; shift 2 ;;
        --new-image) new_image=${2:?}; shift 2 ;;
        --live) live=${2:?}; shift 2 ;;
        --out) out=${2:?}; shift 2 ;;
        --keep) keep=yes; shift ;;
        --empty) empty=yes; shift ;;
        *) usage ;;
    esac
done

# The check itself could not run; 1 and 2 are the results CHECK and STOP.
fail() {
    echo "ERROR: $*" >&2
    exit 3
}

# The published $FROM_VERSION image for arm64 does not start (it crashes
# while hashing the first password), so an arm64 machine runs $FROM_VERSION
# as amd64, emulated.
case $(uname -m) in
    arm64 | aarch64) CURRENT_PLATFORM=${CURRENT_PLATFORM:-linux/amd64} ;;
esac

if [ "$empty" = no ]; then
    [ -n "$backups" ] && [ -n "$live" ] || usage
    [ -s "$live" ] || fail "$live is missing or empty; take it first (README, step 1)"
    [ -d "$backups/postgres" ] && [ -d "$backups/mongo" ] \
        || fail "$backups does not hold the folders postgres/ and mongo/"
    if [ -z "$name" ]; then
        # The newest backup present and not empty in both folders; the names
        # carry the date, so they sort by time.
        for file in "$backups"/postgres/mhira-data-*.dump; do
            [ -s "$file" ] && [ -s "$backups/mongo/$(basename "$file")" ] && name=$(basename "$file")
        done
        [ -n "$name" ] || fail "no complete backup pair in $backups"
    fi
    pg_dump_file="$backups/postgres/$name"
    mongo_dump_file="$backups/mongo/$name"
    [ -s "$pg_dump_file" ] || fail "$pg_dump_file is missing or empty"
    [ -s "$mongo_dump_file" ] || fail "$mongo_dump_file is missing or empty"
fi

out=${out:-./upgrade-check-$(date +%Y-%m-%dT%H-%M-%S)}
if [ -e "$out" ] && [ -n "$(ls -A "$out")" ]; then
    fail "$out exists and is not empty"
fi
mkdir -p "$out/logs"
out=$(cd "$out" && pwd)
# The logs hold the installation's data (what each version showed, and a
# failed restore prints the row it failed on), so only the owner may read
# them.
chmod 700 "$out" "$out/logs"

# The dump gives every object to the installation's Postgres user, so the
# throwaway Postgres gets a user of that name, or the restore would fail on
# every ownership.
if [ "$empty" = no ]; then
    PG_USER=$(sed -n 's/^ALTER .* OWNER TO "\{0,1\}\([^";]*\)"\{0,1\};$/\1/p' "$pg_dump_file" | head -1)
fi
PG_USER=${PG_USER:-default}
PG_DB=mhira
PG_PASSWORD=$(od -An -N16 -tx1 /dev/urandom | tr -d ' \n')
THROWAWAY_SECRET=$(od -An -N24 -tx1 /dev/urandom | tr -d ' \n')
# The Mongo database: as given, else the one the installation's inventory
# names, else the shipped one.
if [ -z "${MONGO_DB:-}" ] && [ -n "$live" ]; then
    MONGO_DB=$(sed -n 's/^mongo_db //p' "$live" | head -1)
fi
MONGO_DB=${MONGO_DB:-questionnaireDB}
BACKEND_IMAGE=$current_image
BACKEND_PLATFORM=
export PG_USER PG_DB PG_PASSWORD THROWAWAY_SECRET MONGO_DB BACKEND_IMAGE BACKEND_PLATFORM

# The login the check reads with: added to the copy only, with a random
# password that is never written down.
READ_USERNAME=upgrade-check
READ_PASSWORD=$(od -An -N24 -tx1 /dev/urandom | tr -d ' \n')
export READ_USERNAME READ_PASSWORD

project=mhira-upgrade-check-$(date +%Y%m%d%H%M%S)
COMPOSE=${COMPOSE:-docker compose}
compose="$COMPOSE -p $project -f $here/compose.yml"
status="$out/status.txt"

cleanup() {
    if [ "$keep" = yes ]; then
        echo "The throwaway stack is still running: $compose ps"
        echo "Remove it with: $compose down -v"
    else
        $compose down -v --remove-orphans >/dev/null 2>&1 || true
    fi
}
trap cleanup EXIT
trap 'exit 130' INT TERM

step() {
    echo "$(date +%H:%M:%S) $*"
}

{
    echo "started_at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "from_version $FROM_VERSION"
    echo "to_version $TO_VERSION"
    echo "backup ${name:-none (empty databases)}"
    echo "current_image $current_image"
    echo "new_image $new_image"
    echo "mongo_db $MONGO_DB"
} > "$status"
[ -z "$live" ] || cp "$live" "$out/inventory-live.txt"

step "Starting the throwaway databases (project $project)"
$compose up -d --quiet-pull postgres mongo redis >"$out/logs/compose-up.log" 2>&1 \
    || fail "the databases did not start, see $out/logs/compose-up.log"
databases_ready() {
    $compose exec -T postgres pg_isready -q -U "$PG_USER" -d "$PG_DB" 2>/dev/null \
        && $compose exec -T mongo mongosh --quiet --eval 'db.runCommand({ ping: 1 }).ok' >/dev/null 2>&1
}
waited=0
until databases_ready; do
    [ "$waited" -lt 120 ] || fail "the throwaway databases did not answer within 120 s, see $out/logs/compose-up.log"
    sleep 2
    waited=$((waited + 2))
done

if [ "$empty" = no ]; then
    # psql reports an error for every object the dump drops first, since the
    # database is empty (about 146 times "does not exist"), and for a
    # setting an older Postgres does not know (transaction_timeout from a
    # newer pg_dump). Any other error counts.
    step "Restoring the Postgres backup"
    if $compose exec -T postgres psql -q -U "$PG_USER" -d "$PG_DB" -f - <"$pg_dump_file" >"$out/logs/restore-postgres.log" 2>&1; then
        errors=$(grep 'ERROR:' "$out/logs/restore-postgres.log" | grep -c -v -e 'does not exist' -e 'transaction_timeout' || true)
        if [ "$errors" -eq 0 ]; then
            echo "restore_postgres ok" >> "$status"
        else
            echo "restore_postgres failed: $errors unexpected errors, see logs/restore-postgres.log" >> "$status"
        fi
    else
        echo "restore_postgres failed: psql could not run, see logs/restore-postgres.log" >> "$status"
    fi

    step "Restoring the Mongo backup"
    if $compose exec -T mongo mongorestore --archive --drop <"$mongo_dump_file" >"$out/logs/restore-mongo.log" 2>&1; then
        # The last line counts what was restored and what failed.
        summary=$(grep 'document(s) restored successfully' "$out/logs/restore-mongo.log" | tail -1 \
            | sed 's/^.*[[:space:]]\([0-9][0-9]* document(s) restored\)/\1/')
        case "$summary" in
            *' 0 document(s) failed to restore.') echo "restore_mongo ok: $summary" >> "$status" ;;
            *) echo "restore_mongo failed: ${summary:-no summary}, see logs/restore-mongo.log" >> "$status" ;;
        esac
    else
        echo "restore_mongo failed: mongorestore exited with an error, see logs/restore-mongo.log" >> "$status"
    fi
fi

# The inventory of the throwaway stack, without the configuration section:
# that would describe this stack, not the installation.
inventory() {
    step "Inventory: $1"
    (cd "$out" && COMPOSE="$compose" CONFIGURATION=no PG_USER="$PG_USER" PG_DB="$PG_DB" MONGO_DB="$MONGO_DB" \
        sh "$here/inventory/shape-inventory.sh") >"$out/inventory-$1.txt" 2>"$out/logs/inventory-$1.err" \
        || echo "inventory_$1 failed, see logs/inventory-$1.err" >> "$status"
}

# Adds the check's login to the copy: a super admin, so it sees every
# patient. 1.1.6 makes the password hash, so the new version must also
# accept a password 1.1.6 stored, as it must for every real user.
add_login() {
    step "Adding the check's own login to the copy"
    hash=$(docker run --rm --network none ${CURRENT_PLATFORM:+--platform "$CURRENT_PLATFORM"} \
        -e READ_PASSWORD --entrypoint node "$current_image" \
        -e "require('./dist/shared/helpers/hash.helper').Hash.make(process.env.READ_PASSWORD).then(h => console.log(h))" \
        2>>"$out/logs/add-login.log") || fail "the password hash could not be made, see $out/logs/add-login.log"
    $compose exec -T postgres psql -q -U "$PG_USER" -d "$PG_DB" -v ON_ERROR_STOP=1 \
        -v username="$READ_USERNAME" -v hash="$hash" -f - >>"$out/logs/add-login.log" 2>&1 <<'SQL' \
        || fail "the login could not be added, see $out/logs/add-login.log"
insert into "user" (username, password, "firstName", "lastName", "isSuperUser", "acceptedTerm")
    values (:'username', :'hash', 'Upgrade', 'Check', true, true);
insert into user_role ("userId", "roleId")
    select u.id, r.id from "user" u, role r where u.username = :'username' and r.code = 'SUPER_ADMIN';
SQL
}

# Starts the backend with the given image and waits until it answers HTTP,
# then lets it run past two runs of the mail cron, which fires every minute:
# a backend that dies on its first cron run, as it would on a reminder it
# cannot process, fails here.
# Returns non-zero if it did not start or did not keep running.
start_backend() {
    label=$1 image=$2 platform=$3
    step "Starting $image"
    $compose stop mhira-backend >/dev/null 2>&1 || true
    # As at the real upgrade: no session from the other version.
    $compose exec -T redis redis-cli FLUSHALL >/dev/null
    BACKEND_IMAGE=$image BACKEND_PLATFORM=$platform \
        $compose up -d --no-deps --force-recreate --quiet-pull mhira-backend >>"$out/logs/compose-up.log" 2>&1 || {
        echo "start_$label failed: the container could not be created, see logs/compose-up.log" >> "$status"
        return 1
    }
    limit=${START_TIMEOUT:-600} waited=0
    while :; do
        state=$(docker inspect -f '{{.State.Status}}' "$($compose ps -a -q mhira-backend)" 2>/dev/null || echo gone)
        if [ "$state" != running ]; then
            echo "start_$label failed: the backend stopped while starting ($state), see logs/backend-$label.log" >> "$status"
            $compose logs --no-color mhira-backend >"$out/logs/backend-$label.log" 2>&1 || true
            return 1
        fi
        if $compose exec -T mhira-backend node -e \
            "require('http').get('http://127.0.0.1:3000/graphql', () => process.exit(0)).on('error', () => process.exit(1))" \
            >/dev/null 2>&1; then
            break
        fi
        if [ "$waited" -ge "$limit" ]; then
            echo "start_$label failed: no answer after ${limit}s, see logs/backend-$label.log" >> "$status"
            $compose logs --no-color mhira-backend >"$out/logs/backend-$label.log" 2>&1 || true
            return 1
        fi
        sleep 5
        waited=$((waited + 5))
    done
    step "Answering after ${waited}s; watching it through two mail cron runs"
    sleep "${SETTLE_SECONDS:-130}"
    state=$(docker inspect -f '{{.State.Status}} {{.RestartCount}}' "$($compose ps -a -q mhira-backend)" 2>/dev/null || echo gone)
    $compose logs --no-color mhira-backend >"$out/logs/backend-$label.log" 2>&1 || true
    if [ "$state" = "running 0" ]; then
        echo "start_$label ok: answering after ${waited}s" >> "$status"
    else
        echo "start_$label failed: the backend stopped after starting ($state), see logs/backend-$label.log" >> "$status"
        return 1
    fi
}

# Reads everything through the running backend (read-all.mjs, in the new
# image's Node, on the throwaway network). What it read is data: it goes to
# logs/ only.
read_all() {
    label=$1
    step "Reading everything the application shows"
    if docker run --rm --network "${project}_internal" ${NEW_PLATFORM:+--platform "$NEW_PLATFORM"} \
        -e READ_USERNAME -e READ_PASSWORD -v "$here:/tool:ro" --entrypoint node "$new_image" \
        /tool/read-all.mjs http://mhira-backend:3000/graphql \
        >"$out/logs/reads-$label.json" 2>"$out/logs/reads-$label.err"; then
        echo "reads_$label ok: $(tail -1 "$out/logs/reads-$label.err")" >> "$status"
    else
        echo "reads_$label failed, see logs/reads-$label.err" >> "$status"
    fi
}

# One version on the copy: start it, read everything, take the inventory.
run_version() {
    label=$1 image=$2 platform=$3
    if start_backend "$label" "$image" "$platform"; then
        read_all "$label"
        inventory "$label"
    fi
}

if [ "$empty" = yes ]; then
    start_backend empty "$current_image" "${CURRENT_PLATFORM:-}" || true
    inventory empty
    step "Done. The reference is made from $out/inventory-empty.txt (README.md, \"For the maintainer\")"
    exit 0
fi

inventory backup
add_login
step "1. $FROM_VERSION on the copy, as the installation runs it now"
run_version before "$current_image" "${CURRENT_PLATFORM:-}"
step "2. The upgrade: $TO_VERSION on the same data"
run_version upgraded "$new_image" "${NEW_PLATFORM:-}"
step "3. The way back: $FROM_VERSION on what $TO_VERSION left"
run_version rolled-back "$current_image" "${CURRENT_PLATFORM:-}"
$compose stop mhira-backend >/dev/null 2>&1 || true

echo "finished_at $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$status"
step "Judging the result"
# evaluate.mjs runs in the new image's Node, without network, as the user
# running this script so the files it writes in logs/ stay theirs.
set +e
docker run --rm --network none ${NEW_PLATFORM:+--platform "$NEW_PLATFORM"} --user "$(id -u):$(id -g)" \
    -v "$out:/work" -v "$here:/tool:ro" --entrypoint node "$new_image" \
    /tool/evaluate.mjs /work >"$out/report.txt" 2>"$out/logs/evaluate.err"
result=$?
set -e
if [ ! -s "$out/report.txt" ]; then
    fail "the evaluation failed, see $out/logs/evaluate.err"
fi
echo
cat "$out/report.txt"
echo
echo "Results in $out. report.txt and the inventory-*.txt files hold no data and can be shared;"
echo "logs/ holds the installation's data: keep it on this machine and delete it with the folder."
exit "$result"
