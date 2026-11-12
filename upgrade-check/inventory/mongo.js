// Shape inventory of the Mongo side: counts only, never contents.
// Runs in mongosh (or the legacy mongo shell) against questionnaireDB.

function line(label, value) { print(label + ' ' + value); }
function byKey(label, rows) { rows.sort((a, b) => String(a._id).localeCompare(String(b._id))).forEach(r => line(label + ' ' + JSON.stringify(r._id), r.n)); }

const q = db.questionnaires;
const a = db.assessments;

line('collections', JSON.stringify(db.getCollectionNames().sort()));
line('questionnaire_versions', q.countDocuments());
// Current = not discarded. Uploading a new version marks the old one zombie.
line('questionnaires_current', q.countDocuments({ zombie: { $ne: true } }));
line('questionnaires_old_versions', q.countDocuments({ zombie: true }));
byKey('questionnaires_by_status', q.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]).toArray());
byKey('questionnaires_by_language', q.aggregate([{ $group: { _id: '$language', n: { $sum: 1 } } }]).toArray());
line('questionnaires_with_null_group', q.countDocuments({ questionGroups: null }));
line('questionnaires_without_groups', q.countDocuments({ 'questionGroups.0': { $exists: false } }));

// Question types, in current questionnaires and in old versions. The type is
// whatever string the upload stored; a typo or a trailing space shows up as
// its own line, which is the point.
for (const [label, match] of [['question_types_current', { zombie: { $ne: true } }], ['question_types_old', { zombie: true }]]) {
  byKey(label, q.aggregate([
    { $match: match }, { $unwind: '$questionGroups' }, { $unwind: '$questionGroups.questions' },
    { $group: { _id: '$questionGroups.questions.type', n: { $sum: 1 } } },
  ]).toArray());
}
byKey('group_appearance_current', q.aggregate([
  { $match: { zombie: { $ne: true } } }, { $unwind: '$questionGroups' },
  { $group: { _id: { $ifNull: ['$questionGroups.appearance', null] }, n: { $sum: 1 } } },
]).toArray());
line('questions_with_relevant_current', q.aggregate([
  { $match: { zombie: { $ne: true } } }, { $unwind: '$questionGroups' }, { $unwind: '$questionGroups.questions' },
  { $match: { 'questionGroups.questions.relevant': { $nin: [null, ''] } } }, { $count: 'n' },
]).toArray()[0]?.n ?? 0);
line('questions_with_calculation_current', q.aggregate([
  { $match: { zombie: { $ne: true } } }, { $unwind: '$questionGroups' }, { $unwind: '$questionGroups.questions' },
  { $match: { 'questionGroups.questions.calculation': { $nin: [null, ''] } } }, { $count: 'n' },
]).toArray()[0]?.n ?? 0);

line('assessments', a.countDocuments());
byKey('assessments_by_status', a.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]).toArray());
line('assessments_with_answers', a.countDocuments({ 'answers.0': { $exists: true } }));
line('assessments_with_several_questionnaires', a.countDocuments({ 'questionnaires.1': { $exists: true } }));
line('assessments_with_bundles', a.countDocuments({ 'questionnaireBundles.0': { $exists: true } }));
line('answers', a.aggregate([{ $unwind: '$answers' }, { $count: 'n' }]).toArray()[0]?.n ?? 0);

// Which value fields an answer carries, and the BSON type of each. "missing"
// means the key is absent; "null" means it is there with null.
const fields = ['textValue', 'numberValue', 'multipleChoiceValue', 'dateValue', 'booleanValue'];
for (const f of fields) {
  byKey('answers_' + f + '_type', a.aggregate([
    { $unwind: '$answers' },
    { $group: { _id: { $type: '$answers.' + f }, n: { $sum: 1 } } },
  ]).toArray());
}
byKey('answers_fields_present', a.aggregate([
  { $unwind: '$answers' },
  { $project: { keys: { $filter: { input: { $map: { input: { $objectToArray: '$answers' }, as: 'kv', in: '$$kv.k' } }, as: 'k', cond: { $in: ['$$k', fields] } } } } },
  { $group: { _id: '$keys', n: { $sum: 1 } } },
]).toArray());
line('answers_valid_false', a.aggregate([{ $unwind: '$answers' }, { $match: { 'answers.valid': false } }, { $count: 'n' }]).toArray()[0]?.n ?? 0);
line('answers_valid_missing', a.aggregate([{ $unwind: '$answers' }, { $match: { 'answers.valid': { $exists: false } } }, { $count: 'n' }]).toArray()[0]?.n ?? 0);
line('answers_with_id', a.aggregate([{ $unwind: '$answers' }, { $match: { 'answers._id': { $exists: true } } }, { $count: 'n' }]).toArray()[0]?.n ?? 0);
byKey('answers_question_type', a.aggregate([{ $unwind: '$answers' }, { $group: { _id: { $type: '$answers.question' }, n: { $sum: 1 } } }]).toArray());
line('answers_empty_text', a.aggregate([{ $unwind: '$answers' }, { $match: { 'answers.textValue': '' } }, { $count: 'n' }]).toArray()[0]?.n ?? 0);
line('answers_empty_multiple_choice_with_other_value', a.aggregate([
  { $unwind: '$answers' },
  { $match: { 'answers.multipleChoiceValue': { $size: 0 }, $or: [{ 'answers.textValue': { $ne: null } }, { 'answers.numberValue': { $ne: null } }, { 'answers.booleanValue': { $ne: null } }, { 'answers.dateValue': { $ne: null } }] } },
  { $count: 'n' },
]).toArray()[0]?.n ?? 0);
line('assessments_with_duplicate_question', a.aggregate([
  { $unwind: '$answers' },
  { $group: { _id: { a: '$_id', q: '$answers.question' }, n: { $sum: 1 } } },
  { $match: { n: { $gt: 1 } } },
  { $group: { _id: '$_id.a' } },
  { $count: 'n' },
]).toArray()[0]?.n ?? 0);
line('assessments_without_createdAt', a.countDocuments({ createdAt: { $exists: false } }));
line('answers_without_timestamps', a.aggregate([{ $unwind: '$answers' }, { $match: { $or: [{ 'answers.createdAt': { $exists: false } }, { 'answers.updatedAt': { $exists: false } }] } }, { $count: 'n' }]).toArray()[0]?.n ?? 0);
