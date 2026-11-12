#!/bin/sh
# Shape and structure inventory of an MHIRA v1.1.x installation: counts,
# names and definitions only, never contents, credentials or secrets.
# Run from the installation's mhira-docker directory. See README.md.
set -eu

here=$(cd "$(dirname "$0")" && pwd)
COMPOSE=${COMPOSE:-docker compose}
PG_SERVICE=${PG_SERVICE:-postgres}
MONGO_SERVICE=${MONGO_SERVICE:-mongo}
BACKEND_SERVICE=${BACKEND_SERVICE:-mhira-backend}

CONFIGURATION=${CONFIGURATION:-yes}

# Postgres user and database: as given, else from .env, else the shipped
# default.
if [ -f .env ]; then
  PG_USER=${PG_USER:-$(sed -n 's/^POSTGRES_USER=//p' .env | tail -1)}
  PG_DB=${PG_DB:-$(sed -n 's/^POSTGRES_DB=//p' .env | tail -1)}
fi
PG_USER=${PG_USER:-default}
PG_DB=${PG_DB:-default}

# The Mongo database: as given, else the one MONGODB_CONNECTION_STRING in
# .env names (what follows the host, up to the options), else the shipped
# default.
if [ -z "${MONGO_DB:-}" ] && [ -f .env ]; then
  MONGO_DB=$(sed -n 's/^MONGODB_CONNECTION_STRING=//p' .env | tail -1 \
    | sed -e 's/?.*$//' -e 's/["'"'"']$//' -e 's#^.*://[^/]*##' -e 's#^/##')
fi
MONGO_DB=${MONGO_DB:-questionnaireDB}

# The settings whose values are printed: switches that change what the
# backend does, none of them a credential, a key, a host or a URL. Every
# other variable is printed by name only, with "set" or "empty".
SHOWN='APP_ENV CACHE_STORE GRAPHQL_PLAYGROUND_ENABLED MAIL_SECURE NODE_ENV REDIS_DB REDIS_ORM_CACHE_DB REDIS_PORT SERVER_PORT TYPEORM_CONNECTION TYPEORM_ENTITIES_DIR TYPEORM_LOGGING TYPEORM_MIGRATIONS TYPEORM_MIGRATIONS_DIR TYPEORM_MIGRATIONS_RUN TYPEORM_MIGRATIONS_TABLE_NAME TYPEORM_PORT TYPEORM_SYNCHRONIZE TZ'
# Hosts are printed only as "as shipped" or "changed": the shipped compose
# file points them at its own services.
HOSTS='REDIS_HOST=redis TYPEORM_HOST=postgres'

echo "# MHIRA shape inventory"
echo "generated_at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "mongo_db $MONGO_DB"

# The installation's configuration: its .env, compose file and running
# backend. rehearse.sh turns it off, because its stack is not the
# installation.
configuration() {
  echo "app_version $(sed -n 's/^APP_VERSION=//p' .env 2>/dev/null | tail -1)"

  echo
  echo "## configuration"
  # The compose file against every version ever published in mhira-docker,
  # by checksum: a match names the version, so its contents need not be sent.
  for file in docker-compose.yml docker-compose.override.yml compose.yml compose.override.yml; do
    [ -f "$file" ] || continue
    sum=$( (sha256sum "$file" 2>/dev/null || shasum -a 256 "$file") | cut -c1-64)
    match=$(grep "^$sum " "$here/compose-hashes.txt" | head -1 | cut -d' ' -f2- || true)
    if [ -n "$match" ]; then
      echo "compose_file $file sha256 $sum matches mhira-docker $match"
    else
      echo "compose_file $file sha256 $sum differs from every published mhira-docker version"
    fi
  done
  echo "compose_services $($COMPOSE config --services 2>/dev/null | sort | tr '\n' ' ')"
  # Image names without a registry host (the part before the first '/' when
  # it holds a dot or a colon, or is localhost): the name and tag are enough.
  $COMPOSE config --images 2>/dev/null | sed -E 's#^([^/]*[.:][^/]*|localhost)/##' | sort | sed 's/^/compose_image /' || true
  # Variable names the compose file sets, without their values.
  for file in docker-compose.yml docker-compose.override.yml compose.yml compose.override.yml; do
    [ -f "$file" ] || continue
    names=$(sed -n 's/^[[:space:]]*-[[:space:]]*\([A-Za-z_][A-Za-z0-9_]*\)=.*/\1/p; s/^[[:space:]]\{6,\}\([A-Z_][A-Z0-9_]*\):.*/\1/p' "$file" | sort -u | tr '\n' ' ')
    echo "compose_variables $file ${names% }"
  done
  # What the running backend actually has, which is what counts. The filter
  # runs inside the container, in the Node the image ships, so a value that is
  # not shown never leaves it, and a value spanning several lines cannot pass
  # for a name.
  if ! $COMPOSE exec -T -e INV_SHOWN="$SHOWN" -e INV_HOSTS="$HOSTS" "$BACKEND_SERVICE" node -e '
    const shown = new Set(process.env.INV_SHOWN.split(" "));
    const hosts = Object.fromEntries(process.env.INV_HOSTS.split(" ").map((pair) => pair.split("=")));
    for (const name of Object.keys(process.env).sort()) {
      if (name.startsWith("INV_") || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) continue;
      const value = process.env[name];
      const shownAs = shown.has(name) ? JSON.stringify(value) : name in hosts ? (value === hosts[name] ? "as shipped" : "changed") : value ? "set" : "empty";
      console.log("backend_env " + name + " " + shownAs);
    }
    // Which options MONGODB_CONNECTION_STRING sets, by name only: the upgraded
    // MongoDB driver refuses some that v1.1.6 accepts. A name is
    // printed only if it is one of these driver option names, matched without
    // case as the driver does; anything else is counted, never printed, so no
    // credential, host or value can come out.
    const options = "appName authMechanism authMechanismProperties authSource autoIndex autoReconnect bufferCommands bufferMaxEntries compressors connectTimeoutMS connectWithNoPrimary directConnection family fsync gssapiServiceName heartbeatFrequencyMS j journal keepAlive keepAliveInitialDelay loadBalanced localThresholdMS maxConnecting maxIdleTimeMS maxPoolSize maxStalenessSeconds minPoolSize noDelay poolSize readConcernLevel readPreference readPreferenceTags reconnectInterval reconnectTries replicaSet retryReads retryWrites safe serverSelectionTimeoutMS serverSelectionTryOnce socketTimeoutMS srvMaxHosts srvServiceName ssl sslCA sslCert sslCRL sslKey sslPass sslValidate tls tlsAllowInvalidCertificates tlsAllowInvalidHostnames tlsCAFile tlsCertificateFile tlsCertificateKeyFile tlsCertificateKeyFilePassword tlsCRLFile tlsDisableCertificateRevocationCheck tlsDisableOCSPEndpointCheck tlsInsecure useNewUrlParser useUnifiedTopology uuidRepresentation w waitQueueMultiple waitQueueTimeoutMS wtimeout wtimeoutMS zlibCompressionLevel".split(" ");
    const byLowerCase = new Map(options.map((option) => [option.toLowerCase(), option]));
    const uri = process.env.MONGODB_CONNECTION_STRING || "";
    const scheme = /^mongodb\+srv:\/\//i.test(uri) ? "mongodb+srv" : /^mongodb:\/\//i.test(uri) ? "mongodb" : uri ? "other" : "none";
    const afterCredentials = uri.slice(uri.lastIndexOf("@") + 1);
    const query = afterCredentials.includes("?") ? afterCredentials.slice(afterCredentials.indexOf("?") + 1) : "";
    const named = query.split("&").filter(Boolean).map((pair) => byLowerCase.get(pair.split("=")[0].toLowerCase()));
    console.log("mongo_uri scheme " + scheme + " options " + (named.filter(Boolean).sort().join(" ") || "none") + " unlisted " + named.filter((name) => !name).length);' 2>/dev/null; then
    echo "backend_env unavailable (is $BACKEND_SERVICE running?)"
  fi
}
if [ "$CONFIGURATION" = yes ]; then
  configuration
fi

echo
echo "## postgres"
$COMPOSE exec -T "$PG_SERVICE" psql -q -At -U "$PG_USER" -d "$PG_DB" \
  -v ON_ERROR_STOP=1 -F ' ' < "$here/postgres.sql"
echo
echo "## postgres structure"
$COMPOSE exec -T "$PG_SERVICE" psql -q -At -U "$PG_USER" -d "$PG_DB" \
  -v ON_ERROR_STOP=1 -F ' ' < "$here/postgres-structure.sql"

# The Mongo 5 image has mongosh; so do newer ones. The legacy `mongo` shell is
# tried as a fallback for installations on an older image.
# --eval rather than stdin: on stdin mongosh echoes a prompt for every line.
if $COMPOSE exec -T "$MONGO_SERVICE" sh -c 'command -v mongosh >/dev/null'; then
  MONGO_SHELL=mongosh
else
  MONGO_SHELL=mongo
fi
echo
echo "## mongo"
$COMPOSE exec -T "$MONGO_SERVICE" $MONGO_SHELL --quiet "$MONGO_DB" --eval "$(cat "$here/mongo.js")"
echo
echo "## mongo structure"
$COMPOSE exec -T "$MONGO_SERVICE" $MONGO_SHELL --quiet "$MONGO_DB" --eval "$(cat "$here/mongo-structure.js")"
