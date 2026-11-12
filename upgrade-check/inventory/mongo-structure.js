// Structure of the Mongo side: names, options, index definitions and
// counts, never contents. Runs in mongosh (or the legacy mongo shell).

function line(label, value) { print(label + ' ' + value); }
// Index and collection definitions as Mongo returns them, keys sorted so two
// installations compare line by line.
function sorted(value) {
  if (Array.isArray(value)) return value.map(sorted);
  if (value && typeof value === 'object' && value.constructor === Object) {
    const out = {};
    Object.keys(value).sort().forEach(k => { out[k] = sorted(value[k]); });
    return out;
  }
  return value;
}
// Index keys keep their order (it is part of the index), the rest is sorted.
function indexSpec(index) {
  const spec = sorted(index);
  spec.key = index.key;
  return JSON.stringify(spec);
}

line('server_version', db.version());
try {
  const fcv = db.adminCommand({ getParameter: 1, featureCompatibilityVersion: 1 });
  line('feature_compatibility_version', fcv.ok ? JSON.stringify(fcv.featureCompatibilityVersion) : 'unavailable');
} catch (e) {
  line('feature_compatibility_version', 'unavailable');
}

// Every database and collection by name, with counts: a cache store in Mongo
// or a database left from an older version shows up here.
let databases = [];
try {
  databases = db.adminCommand({ listDatabases: 1, nameOnly: true }).databases.map(d => d.name).sort();
} catch (e) {
  databases = [db.getName()];
}
for (const name of databases.filter(n => !['admin', 'config', 'local'].includes(n))) {
  const other = db.getSiblingDB(name);
  for (const info of other.getCollectionInfos().sort((x, y) => x.name.localeCompare(y.name))) {
    const qualified = name + '.' + info.name;
    line('collection ' + qualified + ' type', info.type || 'collection');
    // A view's pipeline can hold literal values; only its source is printed.
    const options = Object.assign({}, info.options || {});
    if ('pipeline' in options) options.pipeline = '(omitted)';
    line('collection ' + qualified + ' options', JSON.stringify(sorted(options)));
    if ((info.type || 'collection') !== 'collection') continue;
    const coll = other.getCollection(info.name);
    line('collection ' + qualified + ' documents', coll.estimatedDocumentCount());
    for (const index of coll.getIndexes().sort((x, y) => x.name.localeCompare(y.name))) {
      line('index ' + qualified + ' ' + index.name, indexSpec(index));
    }
  }
}

// The unique index {language, abbreviation} on questionnaires is built at
// every start and fails where these pairs repeat.
const pairs = (match) => db.questionnaires.aggregate([
  { $match: match },
  { $group: { _id: { l: '$language', a: '$abbreviation' }, n: { $sum: 1 } } },
  { $match: { n: { $gt: 1 } } },
  { $group: { _id: null, pairs: { $sum: 1 }, documents: { $sum: '$n' } } },
]).toArray()[0] || { pairs: 0, documents: 0 };
const all = pairs({});
const current = pairs({ zombie: { $ne: true } });
line('questionnaires_duplicate_language_abbreviation_pairs', all.pairs);
line('questionnaires_duplicate_language_abbreviation_documents', all.documents);
line('questionnaires_duplicate_language_abbreviation_pairs_current', current.pairs);
line('questionnaires_without_language_or_abbreviation', db.questionnaires.countDocuments({ $or: [{ language: { $in: [null, ''] } }, { abbreviation: { $in: [null, ''] } }] }));

// Top-level keys of each MHIRA collection's documents, and how many carry
// each: the field names the schemas declare and any others an older version
// left. Key names only.
for (const name of ['assessments', 'questionnaires', 'questionnaire_bundle']) {
  db.getCollection(name).aggregate([
    { $project: { keys: { $map: { input: { $objectToArray: '$$ROOT' }, as: 'kv', in: '$$kv.k' } } } },
    { $unwind: '$keys' },
    { $group: { _id: '$keys', n: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]).toArray().forEach(r => line('keys ' + name + ' ' + r._id, r.n));
}
// The key order of the assessments' top level, as stored: the new version's
// Mongoose writes the keys of a new document in another order than 1.1.6's.
// The order only, as one string per distinct order.
db.assessments.aggregate([
  { $project: { order: { $reduce: { input: { $map: { input: { $objectToArray: '$$ROOT' }, as: 'kv', in: '$$kv.k' } }, initialValue: '', in: { $concat: ['$$value', ',', '$$this'] } } } } },
  { $group: { _id: '$order', n: { $sum: 1 } } },
  { $sort: { _id: 1 } },
]).toArray().forEach(r => line('key_order assessments ' + r._id.slice(1), r.n));
