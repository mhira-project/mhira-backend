import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard } from "src/modules/auth/auth.guard";
import { CreatePatientInput } from "../dto/create-patient.input";
import { PatientConnectionDto } from "../dto/patient-connection.model";
import { PatientFilter } from "../dto/patient.filter";
import { UpdatePatientInput } from "../dto/update-patient.input";
import { Patient } from "../models/patient.model";
import { PatientService } from "../providers/patient.service";

@Resolver(() => Patient)
@UseGuards(GqlAuthGuard)
export class PatientResolver {

    constructor(
        private readonly patientService: PatientService,
    ) { }

    @Query(() => PatientConnectionDto, { deprecationReason: "Replaced with `patients` query" })
    getPatients(
        @Args() args: PatientFilter,
    ): Promise<PatientConnectionDto> {
        return this.patientService.list(args);
    }

    @Query(() => Patient, { deprecationReason: "Replaced with `patient` query" })
    getPatient(
        @Args('id') patientId: number,
    ): Promise<Patient> {
        return this.patientService.getOne(patientId);
    }

    @Mutation(() => Patient, { deprecationReason: "Replaced with `createOnePatient` and `createManyPatients` mutation" })
    createPatient(
        @Args('input') input: CreatePatientInput
    ): Promise<Patient> {
        return this.patientService.create(input);
    }

    @Mutation(() => Patient, { deprecationReason: "Replaced with `updateOnePatient` and `updateManyPatients` mutation" })
    updatePatient(
        @Args({ name: 'id', type: () => Int }) patientId: number,
        @Args('input') input: UpdatePatientInput
    ): Promise<Patient> {
        return this.patientService.update(patientId, input);
    }

    @Mutation(() => Boolean, { deprecationReason: "Replaced with `deleteOnePatient` and `deleteManyPatients` mutation" })
    deletePatient(
        @Args({ name: 'id', type: () => Int }) patientId: number
    ): Promise<boolean> {
        return this.patientService.delete(patientId);
    }

}
