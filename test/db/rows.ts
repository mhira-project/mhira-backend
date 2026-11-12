import { Types } from 'mongoose';
import { BaseEntity } from 'typeorm';
import { AssessmentTypeEnum } from 'src/modules/assessment/enums/assessment-type.enum';
import { Assessment } from 'src/modules/assessment/models/assessment.model';
import { AssessmentType } from 'src/modules/assessment/models/assessment-type.model';
import { Caregiver } from 'src/modules/caregiver/models/caregiver.model';
import { PatientCaregiver } from 'src/modules/caregiver/models/patient-caregiver.model';
import { Department } from 'src/modules/department/models/department.model';
import { Patient } from 'src/modules/patient/models/patient.model';
import { Role } from 'src/modules/permission/models/role.model';
import { QuestionnaireScript } from 'src/modules/questionnaire/models/questionnaire-script.model';
import { Report } from 'src/modules/report/models/report.model';
import { User } from 'src/modules/user/models/user.model';

// The rows a database test creates for itself, each with the columns the
// schema requires and whatever the test passes. Everything is invented.
// They save through the entities, so they need a testing module that has
// started (lookupModule).

let created = 0;

/** A number no other row of this test file has, for the columns that must be unique. */
function serial(): number {
    return ++created;
}

function save<Entity extends BaseEntity>(
    entity: Entity,
    fields: Partial<Entity>,
): Promise<Entity> {
    return Object.assign(entity, fields).save();
}

export function newPatient(fields: Partial<Patient> = {}) {
    return save(new Patient(), {
        firstName: 'Alex',
        lastName: `Patient ${serial()}`,
        ...fields,
    });
}

export function newUser(fields: Partial<User> = {}) {
    const number = serial();
    return save(new User(), {
        username: `user${number}`,
        password: 'not a password hash',
        firstName: 'Sam',
        lastName: `User ${number}`,
        ...fields,
    });
}

export function newAssessmentType(fields: Partial<AssessmentType> = {}) {
    return save(new AssessmentType(), {
        name: `Type ${serial()}`,
        // The column has no default in the schema the migrations build.
        status: AssessmentTypeEnum.ACTIVE,
        ...fields,
    });
}

/** An assessment of `patient`, of a type of its own, pointing at a Mongo document that does not exist. */
export async function newAssessment(
    patient: Patient,
    fields: Partial<Assessment> = {},
) {
    return save(new Assessment(), {
        patientId: patient.id,
        assessmentTypeId: (await newAssessmentType()).id,
        questionnaireAssessmentId: new Types.ObjectId().toHexString(),
        ...fields,
    });
}

export function newCaregiver(fields: Partial<Caregiver> = {}) {
    const number = serial();
    return save(new Caregiver(), {
        firstName: 'Kim',
        lastName: `Caregiver ${number}`,
        phone: `+000 555 ${number}`,
        ...fields,
    });
}

/** The link that makes `caregiver` a caregiver of `patient`. */
export function newPatientCaregiver(
    patient: Patient,
    caregiver: Caregiver,
    fields: Partial<PatientCaregiver> = {},
) {
    return save(new PatientCaregiver(), {
        patientId: patient.id,
        caregiverId: caregiver.id,
        ...fields,
    });
}

export function newRole(fields: Partial<Role> = {}) {
    return save(new Role(), { name: `Role ${serial()}`, ...fields });
}

export function newDepartment(fields: Partial<Department> = {}) {
    return save(new Department(), { name: `Ward ${serial()}`, ...fields });
}

export function newReport(fields: Partial<Report> = {}) {
    return save(new Report(), {
        name: `Report ${serial()}`,
        description: 'Invented',
        resources: 'patient',
        ...fields,
    });
}

export function newQuestionnaireScript(
    fields: Partial<QuestionnaireScript> = {},
) {
    return save(new QuestionnaireScript(), {
        name: `Script ${serial()}`,
        scriptText: '# invented',
        questionnaireId: new Types.ObjectId().toHexString(),
        ...fields,
    });
}
