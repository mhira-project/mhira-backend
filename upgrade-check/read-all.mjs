// Reads everything a user can see in the throwaway copy through the
// backend's GraphQL API, the way the frontend and the Shiny data export ask
// for it: every patient, every assessment with its questionnaires and
// answers, every patient's report, every questionnaire and bundle, and what
// the administration screens list (users, roles, departments, caregivers,
// mail templates, report definitions, settings). Prints
// one JSON object, keyed by what was read, so evaluate.mjs can compare what
// the two versions show, and a count on stderr. The JSON is the
// installation's data: rehearse.sh writes it to logs/, and it never leaves
// the machine.
//
//   node read-all.mjs <graphql url> > reads.json
//       READ_USERNAME and READ_PASSWORD: the login rehearse.sh added to the
//       copy.

const [url] = process.argv.slice(2);
// The largest page the backend allows.
const PAGE = 50;

const PATIENT_FIELDS = `
    id statusId medicalRecordNo firstName middleName lastName phone phone2
    email addressStreet addressNumber addressApartment addressPlace
    addressPostalCode addressCountryCode gender birthDate active deleted
    createdAt updatedAt deletedAt
    departments { id name }
    caseManagers { id username }`;

const ASSESSMENT_FIELDS = `
    id uuid date status emailReminder emailStatus receiverEmail patientId
    clinicianId mailTemplateId submissionDate deliveryDate expirationDate note
    informantType informantCaregiverRelation createdAt updatedAt deletedAt
    assessmentType { id name }`;

// A questionnaire as the frontend's assessment screens select it.
const QUESTIONNAIRE_FIELDS = `
    _id name status createdAt keywords copyright website license
    timeToComplete language abbreviation description
    questionGroups {
        label
        questions {
            _id name label type hint relevant calculation constraint
            constraintMessage min max required requiredMessage image
            appearance default
            choices { name label image }
        }
    }`;

const FULL_ASSESSMENT = `query ($id: Int!) {
    getFullAssessment(id: $id) {
        ${ASSESSMENT_FIELDS}
        questionnaireAssessment {
            _id status
            answers {
                question valid textValue multipleChoiceValue numberValue
                dateValue booleanValue
            }
            questionnaireBundles { _id name }
            questionnaires(populate: true) { ${QUESTIONNAIRE_FIELDS} }
        }
    }
}`;

// The Shiny data export's report query.
const PATIENT_REPORT = `query ($id: ID!) {
    generatePatientReport(id: $id) {
        answeredQuestionnaires {
            assessmentId _id name questionnaireFullName language
            questions {
                variable type required questionGrouplabel
                choices { label name }
                answer {
                    textValue numberValue dateValue multipleChoiceValue
                    createdAt updatedAt
                }
            }
        }
        assessments { assessmentId status assessmentType { name } }
        questionnaireScripts {
            id name questionnaireId questionnaireName questionnaireLanguage
            scriptText version
        }
    }
}`;

// What the administration screens list: the query, the key its items are
// stored under, and the fields. All sort by id.
const ADMINISTRATION = [
    [
        'users',
        'user',
        `id username active firstName middleName lastName email phone workID
        address gender birthDate nationality isSuperUser acceptedTerm
        passwordChangeRequired passwordExpiresAt createdAt updatedAt deletedAt
        roles { id } departments { id }`,
    ],
    [
        'roles',
        'role',
        `id name code hierarchy isSuperAdmin isNoRole createdAt updatedAt
        permissions { id }`,
    ],
    ['permissions', 'permission', 'id name group createdAt updatedAt'],
    [
        'departments',
        'department',
        'id name description active createdAt updatedAt deletedAt',
    ],
    [
        'patientStatuses',
        'patient-status',
        'id name description createdAt updatedAt',
    ],
    [
        'assessmentTypes',
        'assessment-type',
        'id name status createdAt updatedAt',
    ],
    [
        'caregivers',
        'caregiver',
        `id firstName middleName lastName email phone street number apartment
        place postalCode country createdAt updatedAt deletedAt`,
    ],
    [
        'patientCaregivers',
        'patient-caregiver',
        `id patientId caregiverId relation note emergency createdAt updatedAt
        deletedAt`,
    ],
    [
        'informants',
        'informant',
        `id patientId firstName middleName lastName phone email address
        relationshipTypeId createdAt updatedAt deletedAt`,
    ],
    [
        'getAllEmailTemplates',
        'mail-template',
        `id name subject body status module isPublic createdAt updatedAt
        departments { id }`,
    ],
    [
        'reports',
        'report-definition',
        `id anonymus name resources description status repositoryLink appName
        url createdAt updatedAt roles { id }`,
    ],
];

let token;

async function graphql(query, variables = {}) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            ...(token && { authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ query, variables }),
    });
    const body = await response.json();
    if (body.errors?.length) return { error: body.errors[0].message };
    return { data: body.data };
}

const reads = {};

// Every node of a cursor-paged list, each stored under its key, except
// those `skip` names. A page that fails is stored as the list's failure, and
// the list ends there.
async function readList(field, args, fields, key, skip = () => false) {
    const nodes = [];
    let after = null;
    do {
        const result = await graphql(
            `query ($paging: CursorPaging) {
                ${field}(paging: $paging${args}) {
                    edges { node { ${fields} } }
                    pageInfo { hasNextPage endCursor }
                }
            }`,
            { paging: { first: PAGE, ...(after && { after }) } },
        );
        if (!result.data) {
            reads[`list ${field}`] = result;
            break;
        }
        const { edges, pageInfo } = result.data[field];
        nodes.push(...edges.map(edge => edge.node).filter(node => !skip(node)));
        after = pageInfo.hasNextPage ? pageInfo.endCursor : null;
    } while (after);
    for (const node of nodes) reads[`${key} ${node.id ?? node._id}`] = node;
    return nodes;
}

const login = await graphql(
    'mutation ($u: String!, $p: String!) { login(identifier: $u, password: $p) { accessToken } }',
    { u: process.env.READ_USERNAME, p: process.env.READ_PASSWORD },
);
if (login.error) throw new Error(`login: ${login.error}`);
token = login.data.login.accessToken;

const byId = ', sorting: [{ field: id, direction: ASC }]';
const patients = await readList('patients', byId, PATIENT_FIELDS, 'patient');
const assessments = await readList('assessments', byId, 'id', 'assessment');

for (const { id } of assessments) {
    const result = await graphql(FULL_ASSESSMENT, { id: Number(id) });
    reads[`assessment ${id}`] = result.data?.getFullAssessment ?? result;
}
for (const { id } of patients) {
    const result = await graphql(PATIENT_REPORT, { id });
    reads[`report ${id}`] = result.data?.generatePatientReport ?? result;
}
// The questionnaire library as the frontend lists it, every version and
// status included; the questions are read with the assessments.
await readList(
    'questionnaires',
    ', sorting: [{ field: createdAt, direction: ASC }]',
    `_id name zombie status createdAt keywords description copyright website
    license timeToComplete language abbreviation`,
    'questionnaire',
);
await readList(
    'getQuestionnaireBundles',
    '',
    '_id name createdAt questionnaires { _id }',
    'bundle',
);

for (const [field, key, fields] of ADMINISTRATION) {
    // Not the check's own login: it is no part of the installation, and
    // logging in changes it.
    await readList(
        field,
        byId,
        fields,
        key,
        node => key === 'user' && node.username === process.env.READ_USERNAME,
    );
}
const settings = await graphql(`
    query {
        settings {
            systemLocale
            systemTimezone
            dateFormat
            timeFormat
            dateTimeFormat
            maxLoginAttempts
            passwordLifeTimeInDays
            passwordReUseCutoffInDays
        }
    }
`);
reads['settings all'] = settings.data?.settings ?? settings;
const disclaimers = await graphql(
    'query { disclaimers { type description updatedAt } }',
);
if (disclaimers.data) {
    for (const disclaimer of disclaimers.data.disclaimers)
        reads[`disclaimer ${disclaimer.type}`] = disclaimer;
} else {
    reads['list disclaimers'] = disclaimers;
}

process.stdout.write(JSON.stringify(reads));
console.error(
    `read ${patients.length} patients, ${assessments.length} assessments, ${
        Object.keys(reads).length
    } items in all`,
);
