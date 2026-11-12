# Changelog

## 2.0.0

The backend moves onto maintained versions of its runtime and libraries:
Node 24, NestJS 11, Apollo Server 5, TypeORM 0.3, Mongoose 9 and
TypeScript 5.9 (from Node 14, NestJS 7, Apollo Server 2, TypeORM 0.2,
Mongoose 5 and TypeScript 3.9). It behaves as 1.1.6 does apart from the
differences listed here.

Nothing changes in the databases: the same tables and collections, and
no new migration. An installation upgrades from 1.1.6 by changing the
backend's image version, and goes back by changing it back; 1.1.6 runs
on databases 2.0.0 has written to. Make a backup first all the same.
An installation older than 1.1.6 moves to 1.1.6 first.

The image is published for `linux/amd64` and `linux/arm64`. The arm64
image of 1.1.6 stopped right after its first start; that is fixed. There
is no 32-bit ARM (`linux/arm/v7`) image any more, because Node 24 has
none.

Requirements: MongoDB 4.4 or later (the shipped image is MongoDB 5) and
PostgreSQL 13, as before.

### API changes

#### `addAnswer` returns the updated assessment status

`addAnswer` returns the assessment after the answer is stored. On the
first answer to an assessment that is open for completion, its `status`
field now reads `PARTIALLY_COMPLETED`, the status the assessment has at
that point in both databases. v1.1.6 returned `OPEN_FOR_COMPLETION` here:
a stale value, because it loaded the assessment before its own status
change had been saved (fixed in this release). From the second
answer on, nothing changes.

No known client selects `status` from `addAnswer`: the MHIRA frontend
asks only for `_id` and `answers`. A third-party client that selects it
may observe the change. Which answers are accepted or refused is
unchanged.

#### Unused operations are removed

Operations the MHIRA frontend and the report apps never send are gone
from the GraphQL schema, with the types only they used: 14 queries and
67 mutations, most of them generated automatically and never meant to
be called. A third-party client that sends one of them gets a GraphQL
validation error.

Queries: `assessment`, `caregiver`, `department`, `emergencyContact`,
`emergencyContacts`, `getAssessment`, `getQuestionnaire`,
`getQuestionnaireVersion`, `patient`, `patientCaregiver`,
`patientStatus`, `permission`, `role`, `user`.

Mutations: `addCaseManagersToPatient`, `addDepartmentsToMailTemplate`,
`addEmergencyContactsToPatient`, `addInformantsToPatient`,
`addPatientCaregiversToCaregiver`, `addPatientCaregiversToPatient`,
`addPermissionsToUser`, `addReportsToQuestionnaireScript`,
`addRolesToReport`, `addUsersToRole`, `createManyDepartments`,
`createManyEmergencyContacts`, `createOneEmergencyContact`,
`createQuestionnaireAssessment`, `deleteAssessmentType`,
`deleteEmailTemplate`, `deleteManyDepartments`,
`deleteManyEmergencyContacts`, `deleteManyPatientCaregivers`,
`deleteManyPatientStatuses`, `deleteOneEmergencyContact`,
`removeAssessmentTypeFromAssessment`, `removeAssessmentsFromPatient`,
`removeCaregiverFromPatientCaregiver`, `removeCaseManagersFromPatient`,
`removeClinicianFromAssessment`, `removeDepartmentsFromMailTemplate`,
`removeEmergencyContactsFromPatient`,
`removeInformantClinicianFromAssessment`, `removeInformantsFromPatient`,
`removePatientCaregiversFromCaregiver`,
`removePatientCaregiversFromPatient`, `removePatientFromAssessment`,
`removePatientFromPatientCaregiver`, `removePermissionsFromUser`,
`removeReportsFromQuestionnaireScript`, `removeRolesFromReport`,
`removeStatusFromPatient`, `removeUsersFromRole`, `restoreManyUsers`,
`restoreOneUser`, `setAssessmentTypeOnAssessment`,
`setAssessmentsOnPatient`, `setCaregiverOnPatientCaregiver`,
`setCaseManagersOnPatient`, `setClinicianOnAssessment`,
`setDepartmentsOnMailTemplate`, `setDepartmentsOnPatient`,
`setDepartmentsOnUser`, `setEmergencyContactsOnPatient`,
`setInformantClinicianOnAssessment`, `setInformantsOnPatient`,
`setPatientCaregiversOnCaregiver`, `setPatientCaregiversOnPatient`,
`setPatientOnAssessment`, `setPatientOnPatientCaregiver`,
`setPermissionsOnUser`, `setReportsOnQuestionnaireScript`,
`setRolesOnReport`, `setRolesOnUser`, `setUsersOnRole`,
`updateManyCaregivers`, `updateManyDepartments`,
`updateManyEmergencyContacts`, `updateManyPatientCaregivers`,
`updateManyPatientStatuses`, `updateOneEmergencyContact`.

Among them are `setDepartmentsOnPatient`, `setDepartmentsOnUser` and
`setRolesOnUser`. These relations are changed with
`addDepartmentsToPatient`, `removeDepartmentsFromPatient`,
`addDepartmentsToUser`, `removeDepartmentsFromUser`, `addRolesToUser` and
`removeRolesFromUser`, which stay with the same arguments and results.

#### Related lists may come in another order

Lists of related items that the request does not sort, such as a role's
permissions, a report's roles, a department's users or a user's roles
and departments, may be listed in another order: the order in which the
links were made. Their contents are unchanged. The order was never
specified; clients that need one should send `sorting`.

#### `extensions.exception` is no longer sent

GraphQL errors no longer carry an `extensions.exception` object. It was
never part of the supported API, and for database errors it sent the SQL
statement and its values to the client. Error codes (`extensions.code`),
messages and `extensions.messages` of validation errors are unchanged
except where listed below.

Some internal error messages read differently:

- An assessment link or id that no longer exists reports "Cannot read
  properties of null (reading 'questionnaireAssessmentId')" instead of
  "Cannot read property 'questionnaireAssessmentId' of undefined".
  Updating a report or a mail template that does not exist, and
  completing an assessment whose database row is missing, read
  "Cannot set properties of null (setting '…')" in the same way.
- Other crash messages use the wording of the newer JavaScript engine:
  "Cannot read properties of null (reading 'questions')" instead of
  "Cannot read property 'questions' of null", and likewise for
  `'length'` of undefined.
- Restoring an assessment that does not exist reports the id it looked
  for instead of "[object Object]".

#### Ids of 12 characters are refused as malformed

An id argument that is not a MongoDB ObjectId was always an error, but
a string of exactly 12 characters used to be taken as an ObjectId's 12
raw bytes, looked up, not found, and reported later: as a crash message
("Cannot read property 'zombie' of null" from `deleteQuestionnaire`,
"Cannot set property 'deleted' of null" from
`deleteQuestionnaireBundle`), as "Not Found" from
`updateQuestionnaireBundle`, or as "Cannot return null for non-nullable
field Query.getQuestionnaireBundle." Such a string is now refused as
malformed before anything is looked up, with the same message as any
other malformed id ("input must be a 24 character hex string, 12 byte
Uint8Array, or an integer", or for `getQuestionnaireBundle` "Cast to
ObjectId failed for value …"). The HTTP status, `extensions.code`
(`INTERNAL_SERVER_ERROR`) and `data: null` are unchanged, and nothing is
stored in either version. The ids MHIRA issues are 24 hexadecimal
characters and are not affected.

Where such a string is one of the questionnaire ids an operation stores
(`createQuestionnaireBundle` and `updateQuestionnaireBundle` in
`questionnaireIds`, `updateAssessment` in its questionnaire list,
`createNewAssessment` in `questionnaireBundles`), v1.1.6 stored the ObjectId made of its 12 bytes, an id no questionnaire
has. The operation is now refused with a validation error ("…
validation failed: questionnaires.0: Cast to [ObjectId] failed for value
…") and nothing is stored. `changeAssessmentStatus`, `createNewAssessment`
and `addAnswer` with such an id failed before and still fail, now with
"Cast to ObjectId failed for value …" instead of a crash message or "No
assessment found.".

The message for every other malformed id also reads differently from
v1.1.6's "Argument passed in must be a single String of 12 bytes or a
string of 24 hex characters".

#### Other error messages

- An assessment saved by two requests at the same moment fails one of
  them with "No matching document found for id … modifiedPaths …"; for
  an assessment stored by an older version without its questionnaire
  lists, the list of paths now also names `questionnaires` or
  `questionnaireBundles`.
- A request with so many invalid fields that their messages exceed
  1,000,000 characters lists messages up to that limit and then
  "Further validation errors were omitted", instead of all of them.
- An id that is not an ObjectId among the questionnaire or bundle ids
  an operation stores (`createQuestionnaireBundle`,
  `updateQuestionnaireBundle`, `updateAssessment`, `createNewAssessment`)
  was refused before and still is, nothing stored, but the validation
  message reads differently: the value is printed as `[ 'abc' ]` instead
  of `["abc"]`, and the message names the model and ends with
  `because of "CastError"`, for example "QuestionnaireBundle validation
  failed: questionnaires.0: Cast to [ObjectId] failed for value
  "[ 'abc' ]" (type string) at path "questionnaires.0" for model
  "QuestionnaireBundle" because of "CastError"".
- An assessment whose questionnaire document is missing reports "No
  document found for query "{ _id: new ObjectId('…') }" …" instead of
  "{ _id: … }".

#### Some request forms are refused

The GraphQL endpoint answers HTTP 400 to a batched request (a JSON
array of operations), to `variables` sent as a JSON string instead of an
object, and to an `operationName` that is not a string. It also refuses,
as a protection against cross-site request forgery, requests that a
browser could send from another site without asking first (`text/plain`
or form bodies, and GET) unless they carry an `Authorization` header or
one of `x-apollo-operation-name` and `apollo-require-preflight`. The
MHIRA frontend and the Shiny apps send none of these; other clients
should send one JSON operation per POST with `Content-Type:
application/json`.

#### Requests refused before GraphQL get their own status

A request the server refuses before it reaches GraphQL, such as a body
over 100 kB (HTTP 413, "request entity too large") or a malformed
multipart upload (HTTP 400, with the reason), is answered with its own
status and reason instead of HTTP 500 "Internal server error". Such
errors that are the server's own fault keep HTTP 500, now with the
message "Internal Server Error". The frontend treats all of these as the
same network error.

### Data changes

#### `createdAt` on documents stored without it

v1.1.6 gave an assessment, questionnaire or questionnaire bundle that
had no `createdAt` field the time of its next save as `createdAt`. The
new version sets `createdAt` only when a document is created, so such a
document keeps having none. Documents MHIRA created always have one.

### Configuration changes

#### When Redis is not reachable

If Redis goes down, the backend now stays up: logins and requests that
need a login fail at once with "Redis is not reachable, and this request
needs it. Please try again later.", the cause is logged
(`[CacheStore] redis: …`), and everything works again as soon as Redis is
back, without restarting the backend. Before, the backend stopped and
was restarted over and over until Redis returned.

#### `TYPEORM_SYNCHRONIZE` is ignored

The backend never synchronizes the database schema with its entities,
whatever `TYPEORM_SYNCHRONIZE` says; the schema is changed only by
migrations. The shipped compose file already sets `false`. With `true`,
v1.1.6 tried to alter the schema at every start, which fails on
existing data. `TYPEORM_MIGRATIONS_TABLE_NAME` keeps working as before:
an installation that set its own migrations table keeps its migration
history.

#### Options in `MONGODB_CONNECTION_STRING` that are no longer accepted

The new MongoDB driver refuses some connection-string options that
v1.1.6 accepted, and the backend does not start if
`MONGODB_CONNECTION_STRING` contains one of them. The shipped compose
file uses none. MongoDB 4.4 or later is required (the shipped image
is MongoDB 5).

Remove these, or replace them as shown, before upgrading:

- `poolSize=N` → `maxPoolSize=N`.
- `gssapiServiceName=X` → `authMechanismProperties=SERVICE_NAME:X`.
- `keepAlive`, `autoReconnect`, `reconnectTries`, `bufferMaxEntries`,
  `safe`, `waitQueueMultiple`, `connectWithNoPrimary`,
  `serverSelectionTryOnce`, `uuidRepresentation`,
  `tlsDisableOCSPEndpointCheck`, `autoIndex`, `bufferCommands`,
  `useUnifiedTopology` and `useNewUrlParser`: remove (the driver no
  longer has them or no longer takes them in the connection string).
- `readConcern=X` → `readConcernLevel=X`.
- `srvMaxHosts` and `srvServiceName` only with a `mongodb+srv://` string.
- The deprecated TLS options: `sslCA` → `tlsCAFile`, `sslCRL` →
  `tlsCRLFile`, `sslCert` and `sslKey` → `tlsCertificateKeyFile` (one
  file holding the certificate and the key), `sslPass` →
  `tlsCertificateKeyFilePassword`, `sslValidate=false` →
  `tlsAllowInvalidCertificates=true`, `tlsCertificateFile` →
  `tlsCertificateKeyFile`. `ssl=true` and `tls=true` keep working.

v1.1.6 accepts the replacements too, so the changed string also works
after a rollback, with one exception: v1.1.6 does not translate
`tlsCRLFile` and does not check the revocation list with it.
