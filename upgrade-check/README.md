# Upgrade check: MHIRA 1.1.6 to 2.0.0

This check is for one upgrade only: an installation that runs MHIRA
**1.1.6** and is about to move to **2.0.0**. Version 2.0.0 brings the
backend onto current versions of Node, NestJS and the database libraries.
It changes nothing in the databases: same tables, same collections, no new
migrations. That is why going back is simply starting 1.1.6 again.

Before the real upgrade, the installation's administrator runs this check
on their own machines. It answers two questions:

- Is this installation's data and setup of a kind 2.0.0 has been tested
  with?
- Does 2.0.0 show this installation's data exactly as 1.1.6 does, and
  does going back to 1.1.6 afterwards work?

Nobody else sees the data, and the check never changes the installation.

An installation on 1.1.5 moves to 1.1.6 first. Between those two only the
frontend image changes, not the backend or the databases. An installation
older than 1.1.5 asks the maintainer.

## What to expect

Before the upgrade you run two commands. The first, on the installation's
server, takes under a minute and only reads. The second runs on a copy of
last night's backup, on that server or on any other computer with Docker, and takes
ten to fifteen minutes for an installation of a few hundred patients,
longer for a larger one. It prints each step as it goes:

    10:02:11 Starting the throwaway databases (project mhira-upgrade-check-…)
    10:02:20 Restoring the Postgres backup
    10:02:24 Restoring the Mongo backup
    10:02:27 Inventory: backup
    10:02:29 Adding the check's own login to the copy
    10:02:31 1. 1.1.6 on the copy, as the installation runs it now
    …
    10:05:40 2. The upgrade: 2.0.0 on the same data
    …
    10:08:52 3. The way back: 1.1.6 on what 2.0.0 left
    …
    10:12:03 Judging the result

On the copy it does what the real upgrade and the way back would do: it
runs 1.1.6, then 2.0.0, then 1.1.6 again. On each it reads every patient,
every assessment with its questionnaires and answers, every patient
report and the questionnaire library, the way the app and the Shiny data
export ask for them, and what the administration screens list: users,
roles and their permissions, departments, caregivers, mail templates,
report definitions and the settings. It then compares what 2.0.0 showed,
and what 1.1.6 showed after going back, with what 1.1.6 showed at the
start.

It ends with a report, one line per check, and one overall result:

    RESULT: PASS

    PASS  Live: the installation runs 1.1.6
    …
    PASS  Upgrade: 2.0.0 shows everything exactly as 1.1.6 does (455 assessments, 145 patients, 692 questionnaires, 145 reports, 12 users, …)
    …
    PASS  Rollback: 1.1.6 after going back shows everything exactly as 1.1.6 does (…)

**PASS** means go ahead, **CHECK** means ask the maintainer first, and
**STOP** means do not upgrade. Step 3 below says what to do with each.

After the real upgrade a third command, which takes seconds, confirms that
the upgrade left the databases built as they were.

## What it reads, and what leaves your machine

Nothing leaves your machine unless you send it.

The report (`report.txt`) and the inventories (`inventory-*.txt`) hold
counts, names and definitions only: how many assessments there are, which
question types occur, which tables and indexes exist, which settings are
switched on, and, where something differs, the names of the fields that
differ. They hold no patient, user or questionnaire content, and no
password, key, connection string, host name or URL. They are safe to send
to the maintainer. Read them before you do. The full list of what the
inventory prints is in `inventory/README.md`.

The folder `logs/` is different. It holds what each version showed, the
differences between them, and the output of the restore and of the
backend: the installation's data. Keep it on your machine, never send it,
and delete it with the rest of the results when you are done.

The throwaway copy has no network connection to the outside. It cannot
send mail or SMS, so no patient receives a reminder from it, and it opens
no port on your machine. The check reads through a login of its own, which
it adds to the copy only, with a random password that is not kept. The
copy is removed, with its data, when the check ends.

## What you need

- Docker with Compose (`docker compose version` prints a version), and a
  few GB of free disk space. The installation's server has both. The
  check uses no port and does not disturb a running MHIRA.
- This folder, `upgrade-check/`, on each machine you run a step on. It is
  part of the 2.0.0 release of `mhira-backend`; this downloads the release
  and leaves the folder in `mhira-backend-2.0.0/upgrade-check`:

      curl -L https://github.com/mhira-project/mhira-backend/archive/refs/tags/v2.0.0.tar.gz | tar xz

- The installation's backup folder (`DATA_BACKUP_PATH` in its `.env`),
  with its `postgres/` and `mongo/` folders, or a copy of one backup pair
  from it.
- An internet connection on the first run, to download the 1.1.6 and
  2.0.0 images.

## Step 1: the inventory, on the installation

On the installation's server, in its `mhira-docker` folder (where
`docker-compose.yml` and `.env` are), with MHIRA running:

    sh /path/to/upgrade-check/inventory/shape-inventory.sh > inventory-live.txt

It only reads. Older installations whose Docker has no `docker compose`
use `COMPOSE=docker-compose sh …`. Keep `inventory-live.txt`: the step
after the real upgrade needs it again.

## Step 2: the rehearsal, on the backup

Copy `inventory-live.txt` to the machine where you run the rehearsal,
then:

    sh /path/to/upgrade-check/rehearse.sh --backups /path/to/backups --live inventory-live.txt

It takes the newest backup present in both `postgres/` and `mongo/`; to
choose another, add `--name mhira-data-<date>.dump`. The results go to a
new folder `upgrade-check-<date and time>` in the current directory, or
where `--out` says.

## Step 3: the result

**PASS.** Nothing was found that 2.0.0 was not tested with, 2.0.0 showed
this installation's data exactly as 1.1.6 does, and 1.1.6 started again
afterwards and still showed the same. Keep `report.txt` with the upgrade
record and upgrade as the release notes describe.

**CHECK.** Something differs from what the upgrade was tested with, but
is not known to be harmful: a setting changed from the shipped one, a
collection or an answer shape the tests do not have. Send `report.txt` and
the `inventory-*.txt` files to the maintainer and wait for an answer
before upgrading.

**STOP.** Do not upgrade this installation. Either something was found
that 2.0.0 is known not to handle, or the rehearsal showed a problem:
2.0.0 did not start, changed the database structure, or showed some of the
data differently from 1.1.6, or 1.1.6 did not work again afterwards. Send
`report.txt` and the `inventory-*.txt` files to the maintainer. Do not
send `logs/`.

A few lines need action on your side:

| Line | What to do |
|---|---|
| `Live: the installation runs …; this upgrade starts from 1.1.6` | Upgrade the installation to 1.1.6 first, then run the check again. |
| `Live: APP_VERSION in the installation's .env is …` | The `.env` does not name a version (`latest`, or nothing), so nobody can tell which one runs. Set `APP_VERSION=1.1.6`, bring the installation up on it, then run the check again. |
| `MONGODB_CONNECTION_STRING has options the new version refuses` | Change the options as the line says, in the installation's `.env`, before upgrading. 1.1.6 accepts the replacements too. |
| `the backend was not running` | Start MHIRA and run step 1 again. |
| `Restore of the … backup: failed` | The backup could not be restored. Try the backup of another night; if that fails too, the backups themselves need looking at, before any upgrade. |

If the rehearsal ends with a line starting `ERROR:` and no report, the
check itself could not run (Docker not running, an image that could not
be downloaded, a full disk). That says nothing about the installation;
the line names the log to look at.

Then delete the results folder, or at least its `logs/` folder.

## After the real upgrade

Before users are let back in, take the inventory again on the upgraded
installation, as in step 1, and compare it with the one from before:

    sh /path/to/upgrade-check/inventory/shape-inventory.sh > inventory-after.txt
    sh /path/to/upgrade-check/compare.sh inventory-live.txt inventory-after.txt

It prints **PASS** when the upgrade left the tables, columns, indexes,
migrations and collections as they were; keep both inventories with the
upgrade record. On **CHECK** or **STOP**, keep users out and send both
inventories to the maintainer.

## Options

| Option or variable | Meaning |
|---|---|
| `--new-image IMAGE` | Upgrade to another image than `mhiraproject/mhira-backend:2.0.0`, for example a release candidate. |
| `--keep` | Leave the throwaway copy running afterwards, to look at it. The end of the output says how to remove it. |
| `MONGO_DB` | The Mongo database name. Not needed normally: step 1 takes it from `MONGODB_CONNECTION_STRING` in the installation's `.env`, and step 2 from the inventory of step 1. |
| `PG_IMAGE`, `MONGO_IMAGE` | The database images of the copy; by default those of the shipped compose file, `postgres:13-alpine` and `mongo:5`. |
| `CURRENT_PLATFORM`, `NEW_PLATFORM` | The platform of the 1.1.6 and the new image, e.g. `linux/amd64`. Not needed normally. On an arm64 machine (Apple silicon) 1.1.6 runs as `linux/amd64` by itself, because the published 1.1.6 arm64 image does not start; that makes its part of the rehearsal slower. |
| `START_TIMEOUT`, `SETTLE_SECONDS` | How long to wait for a backend to answer (600 s), and how long to watch it afterwards (130 s, two runs of its mail job). |
| `COMPOSE` | The compose command, e.g. `docker-compose`. |
| `NEW_IMAGE` | For `compare.sh`: another image than `mhiraproject/mhira-backend:2.0.0` to run the comparison in. |

`rehearse.sh` and `compare.sh` exit with 0 for PASS, 1 for CHECK and 2 for
STOP; `rehearse.sh` exits with 3 when the check itself could not run.

## For the maintainer

The two versions are set in `versions.sh` (`FROM_VERSION`, `TO_VERSION`);
the scripts and the report take them from there. The reference, the
tested lists and this guide are about 1.1.6 to 2.0.0; the next upgrade
needs its own.

`evaluate.mjs` holds what the upgrade is tested with (`TESTED`: question
types, answer value types, the shipped settings, the connection-string
options the driver refuses) and compares the backup's structure with
`reference/structure-1.1.6.txt`, the structure of a fresh 1.1.6
installation. Keep `TESTED` in step with the upgrade's tests and the
release notes. `read-all.mjs` holds the reads; a field added there
must exist in both versions' schemas.

Three things vary between any two reads, on 1.1.6 as much as on 2.0.0,
and `evaluate.mjs` leaves them out of the comparison: the order of lists
the API does not sort (`UNORDERED`: related lists, and a patient report's
questionnaires, assessments and scripts); the `updatedAt` of an expired
assessment, which every read saves again (`comparable`); and
the status, reminder status and `updatedAt` of an assessment whose
delivery or expiration date passes while the check runs
(`turnedByTheClock`; the report says how many). Any other difference is a
STOP until it is understood.

The backend of the copy starts the way `mhira-docker` starts it, with the
image's own command (`node dist/main`), not with `start.sh`.

What the check has not been run on yet:

- Real x86 hardware. Every run so far was on an Apple silicon Mac, with
  2.0.0 built for arm64. That run matters: Rosetta, the Mac's x86
  emulation, misreads decimal numbers in Node 24 (7.5 comes back as 7),
  and the read comparison is the step that would catch it if real x86
  servers turn out to have it too. For the same reason, never run the
  2.0.0 image as `linux/amd64` on Apple silicon: a STOP from such a run
  says nothing about the backend.
- A backup from before 1.1.6. It is expected to end in STOP with "Upgrade
  the installation to 1.1.6 first".

The reference is made from 1.1.6 on empty databases:

    sh upgrade-check/rehearse.sh --empty --out /tmp/empty-1.1.6
    node upgrade-check/evaluate.mjs --reference /tmp/empty-1.1.6/inventory-empty.txt > upgrade-check/reference/structure-1.1.6.txt

A fresh installation has only the `questionnaires` collection; Mongo
creates `assessments` and `questionnaire_bundle` with their first
document, and the evaluation expects them, where present, with the
default `_id` index only.

`inventory/compose-hashes.txt` lists the SHA-256 of every published
`docker-compose.yml`; how to regenerate it is in `inventory/README.md`.
