import { Injectable, NotImplementedException } from "@nestjs/common";
import { CreatePatientInput } from "../dto/create-patient.input";
import { PatientConnection } from "../dto/patient-connection.model";
import { PatientFilter } from "../dto/patient.filter";
import { UpdatePatientInput } from "../dto/update-patient.input";
import { Patient } from "../models/patient.model";

@Injectable()
export class PatientService {

    list(filter: PatientFilter): Promise<PatientConnection> {
        throw new NotImplementedException();
    }

    create(input: CreatePatientInput): Promise<Patient> {
        throw new NotImplementedException();
    }

    update(patientId: number, input: UpdatePatientInput): Promise<Patient> {
        throw new NotImplementedException();
    }

    delete(patientId: number): Promise<boolean> {
        throw new NotImplementedException();
    }
}
