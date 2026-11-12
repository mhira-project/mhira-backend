# Shape inventory

Counts, names and definitions only, never contents. It tells us which
shapes an installation's data has (question types, answer value fields and
their BSON types, odd answers, row counts), how its databases are built
(tables, columns, indexes and constraints in Postgres; collections, their
options and every index definition in Mongo), and how its backend is
configured, so the upgrade can be checked against it. It is run on the
installation's own server before the upgrade and again after the new
version has started, and by `../rehearse.sh` on a restored backup; when and
why, and how to read the result, are in `../README.md`. Nothing in it identifies a patient, a user
or a questionnaire, and it prints no password, key, token, connection
string, host name or URL. It does print the names of the databases on the
Mongo server and of their collections, and the names and tags of the images
the compose file uses (without a registry host).

It is one shell script, two SQL files, two mongosh files and a list of
checksums, and needs only the `docker compose` the installation already
uses.

## Run

From the installation's `mhira-docker` directory (where `docker-compose.yml`
and `.env` are), with the stack running:

    sh /path/to/inventory/shape-inventory.sh > inventory-<installation>-<date>-before.txt

It reads from the `postgres`, `mongo` and `mhira-backend` services of that
compose project with the credentials from `.env`. It only reads: no row,
document, index or setting is changed. It takes under a minute.

Read the output once: every line is a label and a number, a type, a name or
a definition. Keep it with the upgrade record.

## What it prints

| Section | What | What it never prints |
|---|---|---|
| `configuration` | The SHA-256 of the compose file(s) and the published `mhira-docker` version it matches, if any (`compose-hashes.txt`); the service names, and the image names and tags without a registry host; the names of the variables the compose file sets; for the running backend, every environment variable by name with `set` or `empty`, the hosts of Postgres and Redis only as `as shipped` or `changed`, and the values of a short list of switches (`CACHE_STORE`, the `TYPEORM_*` behaviour settings, `NODE_ENV`, `TZ` and the like; `SHOWN` in the script); for `MONGODB_CONNECTION_STRING`, its scheme and the names of the options it sets, each checked against a list of MongoDB driver option names, with any other name only counted | Any other value: passwords, `JWT_SECRET`, `FRONTEND_ENCRYPTION_KEY`, `MONGODB_CONNECTION_STRING`, mail settings, URLs, domains, the application name. The filter runs inside the backend container, so those values never leave it |
| `postgres` | Row counts of the main tables | Any row |
| `postgres structure` | Server version, encoding and time zone, extensions, tables, columns with type, nullability and default, index and constraint definitions, enum values, sequences, views and triggers by name, the applied migrations by name | Any row, view definition or sequence value |
| `mongo` | Counts of question types, answer value fields and their BSON types, statuses, odd answers | Any document or value |
| `mongo structure` | Server and feature-compatibility version; every non-system database and its collections by name, with options (a view's pipeline omitted), document count and the full definition of each index; the duplicate `{language, abbreviation}` pairs among questionnaires (counts); the top-level field names of the MHIRA collections and how many documents carry each; the distinct key orders of assessments | Any document or value |

## Options

| Variable | Default | Meaning |
|---|---|---|
| `COMPOSE` | `docker compose` | The compose command, e.g. `docker-compose` on older installations |
| `PG_SERVICE`, `MONGO_SERVICE`, `BACKEND_SERVICE` | `postgres`, `mongo`, `mhira-backend` | Service names in `docker-compose.yml` |
| `MONGO_DB` | The one `MONGODB_CONNECTION_STRING` in `.env` names, else `questionnaireDB` | The Mongo database; the inventory's `mongo_db` line names it |
| `PG_USER`, `PG_DB` | `POSTGRES_USER` and `POSTGRES_DB` from `.env`, else `default` | The Postgres user and database |
| `CONFIGURATION` | `yes` | `no` leaves out the `configuration` section; `rehearse.sh` does, since its throwaway stack is not the installation |

`compose-hashes.txt` lists the SHA-256 of every version of
`docker-compose.yml` committed to `mhira-docker`, with its commit and date.
Regenerate it from the `mhira-docker` checkout when the compose file
changes:

    for c in $(git log --all --format=%H -- docker-compose.yml); do
      echo "$(git show $c:docker-compose.yml | shasum -a 256 | cut -c1-64) $(git describe --tags --always $c) $(git log -1 --format=%cs $c)"
    done | sort -u -k1,1 | sort -k3 > ../mhira-backend/upgrade-check/inventory/compose-hashes.txt
