import { NotImplementedException } from "@nestjs/common";
import { Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreatePatientInput } from "../dto/create-patient.input";
import { PatientConnection } from "../dto/patient-connection.model";
import { PatientFilter } from "../dto/patient.filter";
import { UpdatePatientInput } from "../dto/update-patient.input";
import { Patient } from "../models/patient.model";
import { PatientService } from "../providers/patient.service";

@Resolver()
export class PatientResolver {

    constructor(
        private readonly patientService: PatientService,
    ) { }

    @Query(() => PatientConnection)
    listPatients(filter: PatientFilter): Promise<PatientConnection> {
        return this.patientService.list(filter);
    }

    @Mutation(() => Patient)
    createPatient(input: CreatePatientInput): Promise<Patient> {
        return this.patientService.create(input);
    }

    @Mutation(() => Patient)
    updatePatient(patientId: number, input: UpdatePatientInput): Promise<Patient> {
        return this.patientService.update(patientId, input);
    }

    @Mutation(() => Boolean)
    deletePatient(patientId: number): Promise<boolean> {
        return this.patientService.delete(patientId);
    }

}
