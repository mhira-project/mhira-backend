MHIRA backend
----------------------------------------------------------------

The GraphQL API of MHIRA, the Mental Health Information Reporting Assistant, built with NestJS on PostgreSQL, MongoDB and Redis. The frontend is [mhira-frontend](https://github.com/mhira-project/mhira-frontend).

Installing MHIRA
----------------------------------------------------------------

MHIRA is installed with Docker from [mhira-docker](https://github.com/mhira-project/mhira-docker), which starts this backend, the frontend, the databases and a web server together. It needs a Linux server (x86-64 or 64-bit ARM) with Docker and its Compose plugin.

    git clone https://github.com/mhira-project/mhira-docker.git
    cd mhira-docker
    cp env-example .env
    # in .env: set APP_VERSION=2.0.0 and SITE_DOMAIN, and replace every password and secret
    docker compose up -d

The README of mhira-docker has the details. The backend image is `mhiraproject/mhira-backend`, published for `linux/amd64` and `linux/arm64`.

What changed between versions is in [CHANGELOG.md](CHANGELOG.md).

Upgrading an installation from 1.1.6 to 2.0.0
----------------------------------------------------------------

Before the upgrade, run the check in [upgrade-check/](upgrade-check/README.md) on a copy of the installation's backup. It needs only Docker, tells whether 2.0.0 shows the installation's data exactly as 1.1.6 does and whether going back works, and never changes the installation.

After the check passes: make a backup, set `APP_VERSION=2.0.0` in the installation's `.env`, and run `docker compose up -d --build`. To go back, set `APP_VERSION=1.1.6` and run the same command; 2.0.0 changes nothing in the databases that 1.1.6 cannot read.

Developing
----------------------------------------------------------------

Node is the version in `.nvmrc`. Copy `.env-sample` to `.env` and point it at a PostgreSQL, a MongoDB and, for `CACHE_STORE=redis`, a Redis.

    npm ci
    npm run build
    npx typeorm migration:run -d dist/data-source.js
    npm run start:dev

`npm run lint:check` runs the linter. The linter, the build, the tests below and a build of the Docker image run on every push and pull request.

Tests
----------------------------------------------------------------

The tests need Node 24 (see `.nvmrc`) and, for two of the three suites, Docker. They use no data from any installation: every test creates the few invented rows it needs and nothing else.

    npm ci
    npm test                      # unit tests, no server needed
    npm run test:services         # start a throwaway Postgres, Mongo and Redis in Docker
    npm run test:db               # the backend's database code against Postgres
    npm run test:cache            # the cache stores against Mongo and Redis
    npm run test:all              # the three suites, one after the other
    npm run test:services:down    # remove the servers and their data

| Suite | Files | What it checks |
|---|---|---|
| `npm test` | `src/**/*.spec.ts` | Single pieces without a server: input validation, the errors a client receives, password hashing, the in-memory cache. |
| `npm run test:db` | `test/db/*.db-test.ts` | The services' lookups and writes on a real Postgres 13. Each file gets an empty database, brought to the current schema by the migrations in `src/migrations`. |
| `npm run test:cache` | `test/cache/*.cache-test.ts` | What the Mongo and Redis cache stores write and read, so that sessions survive an upgrade from 1.1.6. |

The servers are defined in [test/docker-compose.yml](test/docker-compose.yml). They listen on this machine only, on ports of their own (Postgres 54329, Mongo 27029, Redis 63799), and keep their data in memory. To use other servers, set `MHIRA_TEST_POSTGRES_URL`, `MHIRA_TEST_MONGO_URL` and `MHIRA_TEST_REDIS_URL` (the defaults are in [test/services.ts](test/services.ts)). The tests create and drop databases and flush Redis, so never point them at data you keep.

To run one file or one test: `npm run test:db -- case-managers`, `npm test -- -t "argon2"`.

Releasing
----------------------------------------------------------------

Raise `version` in `package.json` and `package-lock.json`, add the version to `CHANGELOG.md`, and publish a GitHub release whose tag is that version. The release workflow builds the image and pushes it to Docker Hub under the version; it refuses a tag that differs from `package.json` and a version that is published already.

Copyright and Licensing
----------------------------------------------------------------

Copyright © 2021 by ‘University of Basel’ and mhira-project (https://github.com/mhira-project; https://mhira-project.org/).

MHIRA is licensed under (an unmodified) Mozilla Public License (MPL) 2.0, the terms of which are included in [LICENSE.md](LICENSE.md). The license applies to all files in the repository. 

Please note that MHIRA is using other open source packages and libraries which are, to our knowledge, compatible with the chosen license. 
