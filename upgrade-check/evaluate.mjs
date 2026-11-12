// Judges what rehearse.sh collected and prints the report: one line per
// check, PASS, CHECK or STOP, and the overall result. The report is as safe
// to share as the inventories: from the inventories and the status file it
// takes labels, counts, names and definitions; from what each version showed
// (logs/reads-*.json, which is data) only how many items differ and the names
// of the fields that do. The differences themselves go to
// logs/differences-*.txt, which stays on the machine.
//
//   node evaluate.mjs <rehearsal folder>
//       The report. Exit code 0 for PASS, 1 for CHECK, 2 for STOP.
//   node evaluate.mjs --compare <inventory before> <inventory after> <from> <to>
//       After the real upgrade (compare.sh): whether it left the structure
//       of the installation's databases as it was. Same exit codes.
//   node evaluate.mjs --reference <inventory of an empty installation>
//       The structure reference (reference/structure-<version>.txt), see
//       README.md, "For the maintainer".

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// What the upgrade has been tested with. Anything outside it is a shape the
// tests have not seen, and the upgrade is not proven for it.
const TESTED = {
    // The question types with a test of upload, answer and report, and the
    // malformed ones 1.1.6's upload accepted ('note ' and the like), which
    // the tests read: the form shows them as unsupported, on every version.
    questionTypes: [
        'checkbox',
        'checkbox minikid',
        'date',
        'date_time',
        'decimal',
        'groups minikid',
        'integer',
        'note',
        'note ',
        'select_multiple',
        'select_multiple_from_file',
        'select_one',
        'text',
        'time',
    ],
    // The BSON types each answer value field may have ("missing": absent).
    answerValueTypes: {
        textValue: ['missing', 'null', 'string'],
        numberValue: ['double', 'int', 'missing', 'null'],
        multipleChoiceValue: ['array', 'missing', 'null'],
        dateValue: ['date', 'missing', 'null'],
        booleanValue: ['bool', 'missing', 'null'],
    },
    // v1.1.6 finds an existing answer by comparing `question` as a string.
    answerQuestionTypes: ['string'],
    // Answer shapes no test writes. Above zero, the maintainer compares the
    // installation with the shapes the tests read before the upgrade goes on.
    untestedShapes: [
        'answers_valid_missing',
        'answers_with_id',
        'answers_without_timestamps',
        'assessments_with_duplicate_question',
    ],
    // The unique {language, abbreviation} index on questionnaires: v1.1.6
    // builds it at every start and fails where the pair repeats, so some
    // installations have it and some do not. Both are fine; it must not go
    // away.
    optionalIndex: 'index questionnaires language_1_abbreviation_1',
    // The MHIRA collections. Mongo creates a collection when its first
    // document is stored, so a fresh installation has only questionnaires;
    // the others, where present, have the default _id index and no other.
    mhiraCollections: ['assessments', 'questionnaire_bundle', 'questionnaires'],
    // The MHIRA collections whose documents must all carry createdAt: the new
    // version no longer adds it to a document saved without one.
    createdAtCollections: [
        'assessments',
        'questionnaire_bundle',
        'questionnaires',
    ],
    postgresMajor: '13',
    mongoMajor: '5',
    mongoMinimum: [4, 4],
    // The shipped compose file's values of the switches the inventory shows.
    shippedSwitches: {
        CACHE_STORE: 'redis',
        TYPEORM_MIGRATIONS_RUN: 'true',
        TYPEORM_MIGRATIONS_TABLE_NAME: 'migrations',
        TYPEORM_SYNCHRONIZE: 'false',
    },
    // Connection-string options the new MongoDB driver refuses, and what
    // replaces them ('' for remove). The release notes have the full text.
    refusedMongoOptions: {
        autoIndex: '',
        autoReconnect: '',
        bufferCommands: '',
        bufferMaxEntries: '',
        connectWithNoPrimary: '',
        gssapiServiceName: 'authMechanismProperties=SERVICE_NAME:…',
        keepAlive: '',
        poolSize: 'maxPoolSize',
        reconnectTries: '',
        safe: '',
        serverSelectionTryOnce: '',
        sslCA: 'tlsCAFile',
        sslCert: 'tlsCertificateKeyFile',
        sslCRL: 'tlsCRLFile',
        sslKey: 'tlsCertificateKeyFile',
        sslPass: 'tlsCertificateKeyFilePassword',
        sslValidate: 'tlsAllowInvalidCertificates',
        tlsCertificateFile: 'tlsCertificateKeyFile',
        tlsDisableOCSPEndpointCheck: '',
        useNewUrlParser: '',
        useUnifiedTopology: '',
        uuidRepresentation: '',
        waitQueueMultiple: '',
    },
};

// Postgres catalog items: the kind and the name identify the item, the rest
// is its definition.
const POSTGRES_KINDS = new Set([
    'column',
    'constraint',
    'enum',
    'extension',
    'index',
    'migration',
    'schema',
    'sequence',
    'table',
    'trigger',
    'view',
]);

// An inventory as a map per section from item to value. Postgres catalog
// items and Mongo structure lines are keyed by their first two or three
// words; count lines by everything but the count.
function parseInventory(file) {
    // The lines before the first section (app_version) go under 'header'.
    const sections = { header: new Map() };
    let current = 'header';
    for (const line of readFileSync(file, 'utf8').split('\n')) {
        if (line.startsWith('## ')) {
            current = line.slice(3);
            sections[current] = new Map();
            continue;
        }
        if (line === '' || line.startsWith('#')) continue;
        const [key, value] = splitLine(current, line);
        sections[current].set(key, value);
    }
    return sections;
}

function splitLine(section, line) {
    const words = line.split(' ');
    const take = n => [words.slice(0, n).join(' '), words.slice(n).join(' ')];
    if (section === 'postgres structure') {
        return take(POSTGRES_KINDS.has(words[0]) ? 2 : 1);
    }
    if (section === 'header') return take(1);
    if (section === 'mongo structure' || section === 'configuration') {
        if (['collection', 'index', 'keys', 'key_order'].includes(words[0]))
            return take(3);
        if (
            ['backend_env', 'compose_file', 'compose_variables'].includes(
                words[0],
            )
        )
            return take(2);
        return take(1);
    }
    const last = line.lastIndexOf(' ');
    return [line.slice(0, last), line.slice(last + 1)];
}

// The MHIRA database's collections and indexes, without the database name,
// so installations with another database name compare too.
function mongoStructure(inventory, database) {
    const out = new Map();
    for (const [key, value] of inventory['mongo structure'] ?? []) {
        const [kind, namespace, name] = key.split(' ');
        if (!['collection', 'index'].includes(kind)) continue;
        if (!namespace.startsWith(database + '.')) continue;
        if (kind === 'collection' && name === 'documents') continue;
        out.set(
            `${kind} ${namespace.slice(database.length + 1)} ${name}`,
            value,
        );
    }
    return out;
}

function postgresStructure(inventory) {
    const out = new Map();
    for (const [key, value] of inventory['postgres structure'] ?? []) {
        if (POSTGRES_KINDS.has(key.split(' ')[0])) out.set(key, value);
    }
    return out;
}

function otherMongoDatabases(inventory, database) {
    const names = new Set();
    for (const key of inventory['mongo structure']?.keys() ?? []) {
        const [kind, namespace] = key.split(' ');
        if (kind === 'collection' && !namespace.startsWith(database + '.')) {
            names.add(namespace.split('.')[0]);
        }
    }
    return [...names].sort();
}

// The items that are missing, extra or different between two maps.
function differences(expected, actual) {
    const out = [];
    for (const [key, value] of expected) {
        if (!actual.has(key)) out.push(`${key} (missing)`);
        else if (actual.get(key) !== value) out.push(`${key} (differs)`);
    }
    for (const key of actual.keys()) {
        if (!expected.has(key)) out.push(`${key} (extra)`);
    }
    return out;
}

function list(items, limit = 15) {
    const shown = items
        .slice(0, limit)
        .map(item => `\n        ${item}`)
        .join('');
    return items.length > limit
        ? `${shown}\n        … and ${items.length - limit} more`
        : shown;
}

// The byKey lines of the mongo section: label "json value" count.
function byKey(inventory, label) {
    const out = new Map();
    for (const [key, count] of inventory.mongo ?? []) {
        if (key.startsWith(label + ' '))
            out.set(JSON.parse(key.slice(label.length + 1)), Number(count));
    }
    return out;
}

function count(inventory, section, key) {
    const value = inventory[section]?.get(key);
    return value === undefined ? undefined : Number(value);
}

class Report {
    results = [];
    add(verdict, text) {
        this.results.push({ verdict, text });
    }
    pass(text) {
        this.add('PASS', text);
    }
    check(text) {
        this.add('CHECK', text);
    }
    stop(text) {
        this.add('STOP', text);
    }
    get result() {
        for (const verdict of ['STOP', 'CHECK']) {
            if (this.results.some(r => r.verdict === verdict)) return verdict;
        }
        return 'PASS';
    }
}

// The installation's own configuration, from the inventory run on its
// server.
function judgeLive(report, live, fromVersion) {
    const version = live.header.get('app_version');
    if (version === fromVersion) {
        report.pass(`Live: the installation runs ${fromVersion}`);
    } else if (/^\d+\.\d+\.\d+$/.test(version ?? '')) {
        report.stop(
            `Live: the installation runs ${version}; this upgrade starts from ${fromVersion}. Upgrade to ${fromVersion} first (from 1.1.5 that is a new frontend image only, no database change), then run this check again`,
        );
    } else {
        report.stop(
            `Live: APP_VERSION in the installation's .env is ${
                version ? `"${version}"` : 'not set'
            }, which does not say which version runs. Set it to ${fromVersion}, bring the installation up on it as for any upgrade, then run this check again`,
        );
    }

    const config = live.configuration ?? new Map();
    const compose = [...config].filter(([key]) =>
        key.startsWith('compose_file '),
    );
    if (compose.length === 0) {
        report.check(
            'Live: no compose file found; run the inventory from the mhira-docker folder',
        );
    }
    for (const [key, value] of compose) {
        if (value.includes(' matches mhira-docker ')) {
            report.pass(
                `Live: ${
                    key.split(' ')[1]
                } is a published mhira-docker version`,
            );
        } else {
            report.check(
                `Live: ${
                    key.split(' ')[1]
                } differs from every published mhira-docker version; find out what was changed`,
            );
        }
    }

    const env = new Map();
    for (const [key, value] of config) {
        if (key.startsWith('backend_env ')) env.set(key.split(' ')[1], value);
    }
    if (env.size === 0 || env.has('unavailable')) {
        report.check(
            'Live: the backend was not running, so its settings are unknown; start it and run the inventory again',
        );
    } else {
        const changed = [];
        for (const [name, shipped] of Object.entries(TESTED.shippedSwitches)) {
            const value = env.get(name);
            if (value !== undefined && value !== JSON.stringify(shipped))
                changed.push(`${name} ${value}`);
        }
        for (const name of ['TYPEORM_HOST', 'REDIS_HOST']) {
            if (env.get(name) === 'changed') changed.push(`${name} changed`);
        }
        const tz = env.get('TZ');
        if (tz !== undefined && !['"UTC"', '""'].includes(tz))
            changed.push(`TZ ${tz}`);
        if (changed.length) {
            report.check(
                `Live: settings the upgrade was not tested with:${list(
                    changed,
                )}`,
            );
        } else {
            report.pass('Live: the backend settings are the shipped ones');
        }
    }

    const uri = [...config].find(([key]) => key === 'mongo_uri')?.[1];
    if (uri) {
        const match = /^scheme (\S+) options (.*) unlisted (\d+)$/.exec(uri);
        const options = match && match[2] !== 'none' ? match[2].split(' ') : [];
        const refused = options.filter(
            option => option in TESTED.refusedMongoOptions,
        );
        if (refused.length) {
            const how = refused.map(option => {
                const replacement = TESTED.refusedMongoOptions[option];
                return replacement
                    ? `${option}: replace with ${replacement}`
                    : `${option}: remove`;
            });
            report.stop(
                `Live: MONGODB_CONNECTION_STRING has options the new version refuses (it would not start); change them before upgrading (release notes):${list(
                    how,
                )}`,
            );
        } else {
            report.pass(
                'Live: MONGODB_CONNECTION_STRING has no option the new version refuses',
            );
        }
        if (match && match[3] !== '0') {
            report.check(
                `Live: MONGODB_CONNECTION_STRING has ${match[3]} option(s) the inventory does not know; find out what they are`,
            );
        }
        if (match && match[1] === 'other') {
            report.check(
                'Live: MONGODB_CONNECTION_STRING is not a mongodb:// or mongodb+srv:// string',
            );
        }
    }

    const postgres = live['postgres structure']?.get('server_version');
    if (postgres !== undefined) {
        if (postgres.split('.')[0] === TESTED.postgresMajor) {
            report.pass(`Live: Postgres ${postgres}`);
        } else {
            report.check(
                `Live: Postgres ${postgres}; the upgrade is tested on Postgres ${TESTED.postgresMajor} only`,
            );
        }
    }
    const mongo = live['mongo structure']?.get('server_version');
    if (mongo !== undefined) {
        const [major, minor] = mongo.split('.').map(Number);
        const [minMajor, minMinor] = TESTED.mongoMinimum;
        if (major < minMajor || (major === minMajor && minor < minMinor)) {
            report.stop(
                `Live: MongoDB ${mongo}; the new version needs MongoDB ${minMajor}.${minMinor} or later`,
            );
        } else if (String(major) !== TESTED.mongoMajor) {
            report.check(
                `Live: MongoDB ${mongo}; the upgrade is tested on MongoDB ${TESTED.mongoMajor} only`,
            );
        } else {
            report.pass(`Live: MongoDB ${mongo}`);
        }
    }
}

// The data in the backup, against the version the upgrade starts from and
// what the tests cover.
function judgeBackup(report, backup, reference, database, fromVersion) {
    const migrations = map =>
        [...map.keys()].filter(key => key.startsWith('migration '));
    const expectedMigrations = migrations(reference.postgres);
    const actual = postgresStructure(backup);
    const actualMigrations = migrations(actual);
    const missing = expectedMigrations.filter(
        m => !actualMigrations.includes(m),
    );
    const extra = actualMigrations.filter(m => !expectedMigrations.includes(m));
    if (extra.length) {
        report.stop(
            `Backup: migrations that are not ${fromVersion}'s; this is not a published version:${list(
                extra,
            )}`,
        );
    } else if (missing.length) {
        report.stop(
            `Backup: ${
                missing.length
            } of ${fromVersion}'s migrations have not run; the data is older than ${fromVersion}. Upgrade the installation to ${fromVersion} first:${list(
                missing,
            )}`,
        );
    } else {
        report.pass(
            `Backup: all ${expectedMigrations.length} migrations of ${fromVersion} applied, no other`,
        );
    }

    const schema = map =>
        new Map([...map].filter(([key]) => !key.startsWith('migration ')));
    const schemaDifferences = differences(
        schema(reference.postgres),
        schema(actual),
    );
    if (schemaDifferences.length) {
        report.stop(
            `Backup: the Postgres schema differs from ${fromVersion}'s (a hand-made change?):${list(
                schemaDifferences,
            )}`,
        );
    } else {
        report.pass(`Backup: the Postgres schema is ${fromVersion}'s`);
    }

    const mongo = mongoStructure(backup, database);
    const expectedMongo = new Map(reference.mongo);
    const idIndex = reference.mongo.get('index questionnaires _id_');
    for (const name of TESTED.mhiraCollections) {
        if (
            expectedMongo.has(`collection ${name} type`) ||
            !mongo.has(`collection ${name} type`)
        )
            continue;
        expectedMongo.set(`collection ${name} type`, 'collection');
        expectedMongo.set(`collection ${name} options`, '{}');
        expectedMongo.set(`index ${name} _id_`, idIndex);
    }
    const indexes = map =>
        new Map([...map].filter(([key]) => key.startsWith('index ')));
    const collections = map =>
        new Map([...map].filter(([key]) => key.startsWith('collection ')));
    const expectedIndexes = indexes(expectedMongo);
    const actualIndexes = indexes(mongo);
    const hasOptional = actualIndexes.has(TESTED.optionalIndex);
    expectedIndexes.delete(TESTED.optionalIndex);
    actualIndexes.delete(TESTED.optionalIndex);
    const indexDifferences = differences(expectedIndexes, actualIndexes);
    if (indexDifferences.length) {
        report.stop(
            `Backup: Mongo indexes differ from ${fromVersion}'s:${list(
                indexDifferences,
            )}`,
        );
    } else {
        report.pass(
            `Backup: the Mongo indexes are ${fromVersion}'s (the unique questionnaire index ${
                hasOptional ? 'present' : 'absent'
            }, both are known)`,
        );
    }
    const collectionDifferences = differences(
        collections(expectedMongo),
        collections(mongo),
    );
    if (collectionDifferences.length) {
        report.check(
            `Backup: Mongo collections differ from ${fromVersion}'s; find out what wrote or removed them:${list(
                collectionDifferences,
            )}`,
        );
    } else {
        report.pass(`Backup: the Mongo collections are ${fromVersion}'s`);
    }
    const others = otherMongoDatabases(backup, database);
    if (others.length) {
        report.check(
            `Backup: Mongo databases besides ${database}; find out what they are:${list(
                others,
            )}`,
        );
    }
    if (!backup['mongo structure']?.has('server_version')) {
        report.stop('Backup: the Mongo structure could not be read');
    }

    const types = new Map();
    for (const label of ['question_types_current', 'question_types_old']) {
        for (const [type, n] of byKey(backup, label))
            types.set(type, (types.get(type) ?? 0) + n);
    }
    const untestedTypes = [...types.keys()].filter(
        type => !TESTED.questionTypes.includes(type),
    );
    if (untestedTypes.length) {
        report.stop(
            `Backup: question types without a test; the upgrade is not proven for them:${list(
                untestedTypes.map(
                    type =>
                        `${JSON.stringify(type)} in ${types.get(
                            type,
                        )} questions`,
                ),
            )}`,
        );
    } else {
        report.pass(
            `Backup: every question type has a test (${[...types.keys()]
                .sort()
                .map(type => JSON.stringify(type))
                .join(', ')})`,
        );
    }

    const untestedValues = [];
    for (const [field, allowed] of Object.entries(TESTED.answerValueTypes)) {
        for (const [type, n] of byKey(backup, `answers_${field}_type`)) {
            if (!allowed.includes(type))
                untestedValues.push(
                    `${field} stored as ${type} in ${n} answers`,
                );
        }
    }
    for (const [type, n] of byKey(backup, 'answers_question_type')) {
        if (!TESTED.answerQuestionTypes.includes(type))
            untestedValues.push(`question stored as ${type} in ${n} answers`);
    }
    if (untestedValues.length) {
        report.stop(
            `Backup: answer values stored in types no test covers:${list(
                untestedValues,
            )}`,
        );
    } else {
        report.pass(
            'Backup: every answer value is stored in a type the tests cover',
        );
    }

    const odd = TESTED.untestedShapes
        .map(label => [label, count(backup, 'mongo', label)])
        .filter(([, n]) => n > 0);
    if (odd.length) {
        report.check(
            `Backup: answer shapes no test writes; the maintainer compares them with what the tests read:${list(
                odd.map(([label, n]) => `${label} ${n}`),
            )}`,
        );
    } else {
        report.pass('Backup: no answer in a shape the tests do not write');
    }

    const withoutCreatedAt = [];
    for (const name of TESTED.createdAtCollections) {
        const documents =
            count(
                backup,
                'mongo structure',
                `collection ${database}.${name} documents`,
            ) ?? 0;
        const carrying =
            count(backup, 'mongo structure', `keys ${name} createdAt`) ?? 0;
        if (carrying < documents)
            withoutCreatedAt.push(
                `${name}: ${documents - carrying} of ${documents}`,
            );
    }
    if (withoutCreatedAt.length) {
        report.stop(
            `Backup: documents without createdAt, which the new version no longer fills in when they are saved; the upgrade waits for the maintainer's decision:${list(
                withoutCreatedAt,
            )}`,
        );
    } else {
        report.pass(
            'Backup: every assessment, questionnaire and bundle has createdAt',
        );
    }

    const duplicates =
        count(
            backup,
            'mongo structure',
            'questionnaires_duplicate_language_abbreviation_pairs',
        ) ?? 0;
    if (duplicates > 0 && hasOptional) {
        report.stop(
            'Backup: questionnaires repeat a language and abbreviation although the unique index exists; that should be impossible',
        );
    }
}

// The structure of the databases must stay as it was. Both inventories were
// taken on a running backend, so the unique questionnaire index, which 1.1.6
// builds at its start where the data allows it, is already there where it
// can be. `cause` is what ran between the two: "the start", "the upgrade".
function judgeStructure(report, name, cause, before, after, database) {
    const postgres = differences(
        postgresStructure(before),
        postgresStructure(after),
    );
    if (postgres.length) {
        report.stop(
            `${name}: ${cause} changed the Postgres schema or the migrations:${list(
                postgres,
            )}`,
        );
    } else {
        report.pass(`${name}: Postgres schema and migrations unchanged`);
    }

    const mongo = differences(
        mongoStructure(before, database),
        mongoStructure(after, database),
    );
    if (mongo.length) {
        report.stop(
            `${name}: ${cause} changed Mongo collections or indexes:${list(
                mongo,
            )}`,
        );
    } else {
        report.pass(`${name}: Mongo collections and indexes unchanged`);
    }
}

// What running another version on the copy changed: nothing may.
function judgeStart(report, name, before, after, database) {
    judgeStructure(report, name, 'the start', before, after, database);

    const shapes = inventory =>
        new Map(
            [...(inventory.mongo ?? [])].filter(([key]) =>
                /^(question_types_|answers_\w+_type |answers_question_type )/.test(
                    key,
                ),
            ),
        );
    const shapeDifferences = differences(shapes(before), shapes(after));
    if (shapeDifferences.length) {
        report.stop(
            `${name}: the start rewrote stored answers or questionnaires:${list(
                shapeDifferences,
            )}`,
        );
    } else {
        report.pass(`${name}: question types and answer value types unchanged`);
    }

    // Totals only: a status may move (the mail cron marks due reminders it
    // cannot send as failed), but nothing may appear or vanish. Access tokens
    // are left out: the check logs in once on every version.
    const totals = inventory => {
        const out = new Map();
        for (const [key, value] of inventory.postgres ?? []) {
            if (!key.includes(' ') && !key.startsWith('access_tokens'))
                out.set(`postgres ${key}`, value);
        }
        for (const key of [
            'questionnaire_versions',
            'assessments',
            'answers',
        ]) {
            out.set(`mongo ${key}`, inventory.mongo?.get(key));
        }
        for (const [key, value] of inventory['mongo structure'] ?? []) {
            if (key.startsWith('collection ') && key.endsWith(' documents'))
                out.set(key, value);
        }
        return out;
    };
    const totalDifferences = differences(totals(before), totals(after));
    if (totalDifferences.length) {
        report.check(
            `${name}: row or document totals changed although nobody used the application:${list(
                totalDifferences,
            )}`,
        );
    } else {
        report.pass(`${name}: no row or document appeared or vanished`);
    }
}

function readStatus(folder) {
    const status = new Map();
    const file = join(folder, 'status.txt');
    if (!existsSync(file)) return status;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
        const space = line.indexOf(' ');
        if (space > 0) status.set(line.slice(0, space), line.slice(space + 1));
    }
    return status;
}

function readReference(fromVersion) {
    const postgres = new Map();
    const mongo = new Map();
    for (const line of readFileSync(
        join(here, 'reference', `structure-${fromVersion}.txt`),
        'utf8',
    ).split('\n')) {
        if (line === '' || line.startsWith('#')) continue;
        const [scope, ...rest] = line.split(' ');
        const text = rest.join(' ');
        if (scope === 'postgres') {
            const [key, value] = splitLine('postgres structure', text);
            postgres.set(key, value);
        } else if (scope === 'mongo') {
            const words = text.split(' ');
            mongo.set(words.slice(0, 3).join(' '), words.slice(3).join(' '));
        }
    }
    return { postgres, mongo };
}

// What one version showed (read-all.mjs), or null if it was not read.
function readReads(folder, label) {
    const file = join(folder, 'logs', `reads-${label}.json`);
    try {
        return JSON.parse(readFileSync(file, 'utf8'));
    } catch {
        return null;
    }
}

const isError = value =>
    value !== null &&
    typeof value === 'object' &&
    Object.keys(value).length === 1 &&
    'error' in value;

// Lists the API returns in no set order are compared as sets: related lists
// (release notes, "Related lists may come in another order"), and a patient
// report's questionnaires, assessments and scripts, whose order varies
// between two reads on 1.1.6 itself. Everything else is compared as it is,
// with object keys sorted.
const UNORDERED = new Set([
    'answeredQuestionnaires',
    'assessments',
    'caseManagers',
    'departments',
    'permissions',
    'questionnaireScripts',
    'roles',
]);

// The assessments whose delivery or expiration date passes while the check
// runs: the backend, on every version, then changes their status when they
// are read, and its mail job their reminder's. Their keys in the reads, and
// the ids of their Mongo documents, by which a patient report names them.
function turnedByTheClock(before, status) {
    const minute = 60_000;
    const start = Date.parse(status.get('started_at')) - minute;
    const end =
        (Date.parse(status.get('finished_at') ?? '') || Date.now()) + minute;
    const during = date => {
        const time = Date.parse(date);
        return time >= start && time <= end;
    };
    const turned = { keys: new Set(), documents: new Set() };
    for (const [key, item] of Object.entries(before)) {
        if (!key.startsWith('assessment ') || isError(item)) continue;
        if (during(item.deliveryDate) || during(item.expirationDate)) {
            turned.keys.add(key);
            turned.documents.add(item.questionnaireAssessment?._id);
        }
    }
    return turned;
}

// An item without what moves between any two reads, on every version.
function comparable(key, value, turned) {
    if (value === undefined || value === null || isError(value)) return value;
    if (turned.keys.has(key)) {
        return {
            ...value,
            status: undefined,
            emailStatus: undefined,
            updatedAt: undefined,
            questionnaireAssessment: value.questionnaireAssessment && {
                ...value.questionnaireAssessment,
                status: undefined,
            },
        };
    }
    // An expired assessment is saved again whenever it is read, on every
    // version.
    if (key.startsWith('assessment ') && value.status === 'EXPIRED')
        return { ...value, updatedAt: undefined };
    if (key.startsWith('report ') && turned.documents.size) {
        return {
            ...value,
            assessments: value.assessments?.map(assessment =>
                turned.documents.has(assessment.assessmentId)
                    ? { ...assessment, status: undefined }
                    : assessment,
            ),
        };
    }
    return value;
}

function canonical(value, key) {
    if (Array.isArray(value)) {
        const items = value.map(item => canonical(item));
        if (!UNORDERED.has(key)) return items;
        return items.sort((a, b) =>
            JSON.stringify(a).localeCompare(JSON.stringify(b)),
        );
    }
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.keys(value)
                .sort()
                .map(name => [name, canonical(value[name], name)]),
        );
    }
    return value;
}

// The field paths at which two canonical items differ, array positions
// written as []: schema names only, never values.
function differingFields(a, b, path = '', out = new Set()) {
    if (JSON.stringify(a) === JSON.stringify(b)) return out;
    const bothObjects =
        a !== null &&
        b !== null &&
        typeof a === 'object' &&
        typeof b === 'object' &&
        Array.isArray(a) === Array.isArray(b);
    if (!bothObjects) {
        out.add(path || '(the whole item)');
    } else if (Array.isArray(a)) {
        if (a.length !== b.length) out.add(`${path}[] (how many)`);
        for (let i = 0; i < Math.min(a.length, b.length); i++)
            differingFields(a[i], b[i], `${path}[]`, out);
    } else {
        for (const name of new Set([...Object.keys(a), ...Object.keys(b)]))
            differingFields(
                a[name],
                b[name],
                path ? `${path}.${name}` : name,
                out,
            );
    }
    return out;
}

// "patient-status" and 2 make "patient statuses".
function plural(kind, n = 2) {
    const words = kind.replace(/-/g, ' ');
    if (n === 1 || kind === 'settings') return words;
    return words + (words.endsWith('s') ? 'es' : 's');
}

// "145 patients, 455 assessments": how many keys of each kind.
function kinds(keys) {
    const counts = new Map();
    for (const key of keys) {
        const kind = key.split(' ')[0];
        counts.set(kind, (counts.get(kind) ?? 0) + 1);
    }
    return [...counts].map(([kind, n]) => `${n} ${plural(kind, n)}`).join(', ');
}

// What a user sees: everything read through a version, against what 1.1.6
// showed on the same data before the upgrade (`before`). Any difference is a
// STOP; the report names the kinds of items and the fields, the details
// (which are data) go to logs/differences-<label>.txt.
function judgeReads(
    report,
    name,
    folder,
    label,
    fromVersion,
    shownBy,
    before,
    turned,
) {
    const after = readReads(folder, label);
    if (!before || !after) {
        report.stop(
            `${name}: there is nothing to compare, the data was not read ${
                before
                    ? `through ${shownBy}`
                    : `through ${fromVersion} before the upgrade`
            }`,
        );
        return;
    }
    const keys = [
        ...new Set([...Object.keys(before), ...Object.keys(after)]),
    ].sort();
    const differing = [];
    const failingOnBoth = [];
    const fieldCounts = new Map();
    const details = [];
    for (const key of keys) {
        const a = before[key];
        const b = after[key];
        if (isError(a) && isError(b)) {
            failingOnBoth.push(key);
            details.push(`${key}\n  fails on both: ${a.error} | ${b.error}`);
            continue;
        }
        const ca = canonical(comparable(key, a, turned));
        const cb = canonical(comparable(key, b, turned));
        if (JSON.stringify(ca) === JSON.stringify(cb)) continue;
        const fields =
            a === undefined || b === undefined
                ? [
                      `(read only ${
                          a === undefined ? 'after' : 'before'
                      } the upgrade)`,
                  ]
                : isError(a) || isError(b)
                ? ['(the read failed on one of the two)']
                : [...differingFields(ca, cb)];
        differing.push(key);
        for (const field of fields) {
            const counted = `${field} in ${plural(key.split(' ')[0])}`;
            fieldCounts.set(counted, (fieldCounts.get(counted) ?? 0) + 1);
        }
        details.push(
            `${key}\n  fields: ${fields.join(
                ', ',
            )}\n  ${fromVersion} before: ${JSON.stringify(
                ca,
            )}\n  ${shownBy}: ${JSON.stringify(cb)}`,
        );
    }
    const detailsFile = `logs/differences-${label}.txt`;
    if (details.length)
        writeFileSync(join(folder, detailsFile), details.join('\n\n') + '\n');

    const alsoFailing = failingOnBoth.length
        ? `; ${kinds(
              failingOnBoth,
          )} cannot be read on ${fromVersion} either, which the upgrade does not change (${detailsFile})`
        : '';
    const notCompared = turned.keys.size
        ? `; the status of ${turned.keys.size} ${plural(
              'assessment',
              turned.keys.size,
          )} that became due or expired while the check ran is not compared`
        : '';
    if (differing.length) {
        report.stop(
            `${name}: ${shownBy} shows ${differing.length} of ${
                keys.length
            } items differently from ${fromVersion} (${kinds(
                differing,
            )})${notCompared}; the details are in ${detailsFile}, which holds data and stays on this machine. Fields that differ:${list(
                [...fieldCounts].map(([field, n]) => `${field}: ${n}`),
            )}`,
        );
    } else {
        report.pass(
            `${name}: ${shownBy} shows everything exactly as ${fromVersion} does (${kinds(
                keys,
            )})${alsoFailing}${notCompared}`,
        );
    }
}

function evaluate(folder) {
    const status = readStatus(folder);
    const fromVersion = status.get('from_version');
    const toVersion = status.get('to_version');
    const database = status.get('mongo_db') ?? 'questionnaireDB';
    const inventory = name => {
        const file = join(folder, `inventory-${name}.txt`);
        return existsSync(file) ? parseInventory(file) : null;
    };
    const report = new Report();

    const live = inventory('live');
    if (live) judgeLive(report, live, fromVersion);
    else
        report.stop(
            'Live: no inventory of the installation itself (step 1); its version and settings are not checked',
        );

    for (const [step, text] of [
        ['restore_postgres', 'Restore of the Postgres backup'],
        ['restore_mongo', 'Restore of the Mongo backup'],
    ]) {
        const value = status.get(step) ?? 'not run';
        if (value.startsWith('ok')) report.pass(`${text}: ${value}`);
        else report.stop(`${text}: ${value}`);
    }

    const backup = inventory('backup');
    if (!backup) {
        report.stop('Backup: no inventory of the restored backup');
        return report;
    }
    judgeBackup(
        report,
        backup,
        readReference(fromVersion),
        database,
        fromVersion,
    );

    // One version's run on the copy: it started, kept running, and the data
    // could be read through it.
    const run = (label, text) => {
        const started = status.get(`start_${label}`) ?? 'not run';
        if (!started.startsWith('ok')) {
            report.stop(
                `${text}: did not start or did not keep running (${started})`,
            );
            return null;
        }
        report.pass(`${text}: started and kept running (${started})`);
        const read = status.get(`reads_${label}`) ?? 'not run';
        if (read.startsWith('ok')) report.pass(`${text}: ${read.slice(4)}`);
        else report.stop(`${text}: reading the data failed (${read})`);
        return inventory(label);
    };

    const before = run('before', `Before: ${fromVersion} on the copy`);
    const upgraded = run('upgraded', `Upgrade: ${toVersion} on the same data`);
    if (before && upgraded)
        judgeStart(report, 'Upgrade', before, upgraded, database);
    const shownBefore = readReads(folder, 'before');
    const turned = shownBefore && turnedByTheClock(shownBefore, status);
    judgeReads(
        report,
        'Upgrade',
        folder,
        'upgraded',
        fromVersion,
        toVersion,
        shownBefore,
        turned,
    );

    const rolledBack = run(
        'rolled-back',
        `Rollback: ${fromVersion} on what ${toVersion} left`,
    );
    if (upgraded && rolledBack)
        judgeStart(report, 'Rollback', upgraded, rolledBack, database);
    judgeReads(
        report,
        'Rollback',
        folder,
        'rolled-back',
        fromVersion,
        `${fromVersion} after going back`,
        shownBefore,
        turned,
    );
    return report;
}

function resultLines(report) {
    return [
        `RESULT: ${report.result}`,
        '',
        ...report.results.map(r => `${r.verdict.padEnd(5)} ${r.text}`),
    ];
}

function printReport(report, folder) {
    const status = readStatus(folder);
    const from = status.get('from_version');
    const to = status.get('to_version');
    const lines = [
        `MHIRA upgrade check: ${from} to ${to}`,
        `backup   ${status.get('backup') ?? '?'}`,
        `images   ${status.get('current_image') ?? '?'}, ${status.get(
            'new_image',
        ) ?? '?'}`,
        `run at   ${status.get('started_at') ?? '?'}`,
        '',
        ...resultLines(report),
        '',
        {
            PASS: `PASS: ${to} shows this installation's data exactly as ${from} does, and going back to ${from} works. Keep this report with the upgrade record and upgrade as the release notes describe.`,
            CHECK:
                'CHECK: send this report and the inventory-*.txt files to the maintainer and wait for an answer before upgrading; each CHECK line needs a decision.',
            STOP:
                'STOP: do not upgrade this installation. Send this report and the inventory-*.txt files to the maintainer.',
        }[report.result],
    ];
    process.stdout.write(lines.join('\n') + '\n');
}

// After the real upgrade: the installation's inventory before it against
// the one taken after it. Rows and documents are not compared: the
// installation was in use between the two.
function compare(beforeFile, afterFile, fromVersion, toVersion) {
    const before = parseInventory(beforeFile);
    const after = parseInventory(afterFile);
    const report = new Report();
    const [versionBefore, versionAfter] = [before, after].map(
        inventory =>
            inventory.header.get('app_version') || 'an unknown version',
    );
    if (versionBefore === fromVersion && versionAfter === toVersion) {
        report.pass(
            `Installation: on ${fromVersion} in the first inventory, on ${toVersion} in the second`,
        );
    } else {
        report.check(
            `Installation: the first inventory is of ${versionBefore} and the second of ${versionAfter}; expected ${fromVersion} before the upgrade and ${toVersion} after it. Are these the right two files, in this order?`,
        );
    }
    judgeStructure(
        report,
        'Installation',
        'the upgrade',
        before,
        after,
        after.header.get('mongo_db') ?? 'questionnaireDB',
    );
    const lines = [
        `MHIRA upgrade check: the installation before and after the upgrade from ${fromVersion} to ${toVersion}`,
        '',
        ...resultLines(report),
        '',
        {
            PASS:
                'PASS: the upgrade left the structure of the databases as it was. Keep both inventories with the upgrade record.',
            CHECK:
                'CHECK: send both inventories to the maintainer before users are let back in.',
            STOP:
                'STOP: the upgrade changed the structure of the databases. Keep users out and send both inventories to the maintainer.',
        }[report.result],
    ];
    process.stdout.write(lines.join('\n') + '\n');
    return report;
}

// The structure lines of an inventory, as the reference keeps them: the
// Postgres catalog items and the MHIRA database's collections and indexes,
// without counts.
function printReference(file, database = 'questionnaireDB') {
    const inventory = parseInventory(file);
    const lines = [
        '# Structure of a fresh installation, made by evaluate.mjs --reference (README.md, "For the maintainer").',
    ];
    for (const [key, value] of postgresStructure(inventory))
        lines.push(`postgres ${key} ${value}`.trimEnd());
    for (const [key, value] of mongoStructure(inventory, database))
        lines.push(`mongo ${key} ${value}`);
    process.stdout.write(lines.join('\n') + '\n');
}

const EXIT_CODES = { PASS: 0, CHECK: 1, STOP: 2 };
const args = process.argv.slice(2);
if (args[0] === '--reference' && args[1]) {
    printReference(args[1], args[2]);
} else if (args[0] === '--compare' && args.length === 5) {
    process.exitCode = EXIT_CODES[compare(...args.slice(1)).result];
} else if (args.length === 1) {
    const report = evaluate(args[0]);
    printReport(report, args[0]);
    process.exitCode = EXIT_CODES[report.result];
} else {
    process.stderr.write(
        'usage: node evaluate.mjs <rehearsal folder> | --compare <inventory before> <inventory after> <from> <to> | --reference <inventory> [database]\n',
    );
    process.exitCode = 64;
}
