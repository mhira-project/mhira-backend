import { PatientStatus } from '../models/patient-status.model';

export class PatientStatusService {
    async create(input): Promise<any> {
        const newPatientStatus = new PatientStatus();

        newPatientStatus.name = input.patientStatus.name;
        newPatientStatus.description = input.patientStatus.description;

        return newPatientStatus.save();
    }
}
