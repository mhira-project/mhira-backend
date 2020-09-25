import { NotImplementedException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard } from "src/modules/auth/auth.guard";
import { UserConnection } from "src/modules/user/dto/user-connection.model";
import { CreatePatientInput } from "../dto/create-patient.input";
import { PatientConnection } from "../dto/patient-connection.model";
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

    @Query(() => PatientConnection)
    getPatients(
        @Args() args: PatientFilter,
    ): Promise<PatientConnection> {
        return this.patientService.list(args);
    }

    @Query(() => Patient)
    getPatient(
        @Args('id') patientId: number,
    ): Promise<Patient> {
        return this.patientService.getOne(patientId);
    }

    @Mutation(() => Patient)
    createPatient(
        @Args('input') input: CreatePatientInput
    ): Promise<Patient> {
        return this.patientService.create(input);
    }

    @Mutation(() => Patient)
    updatePatient(
        @Args({ name: 'id', type: () => Int }) patientId: number,
        @Args('input') input: UpdatePatientInput
    ): Promise<Patient> {
        return this.patientService.update(patientId, input);
    }

    @Mutation(() => Boolean)
    deletePatient(
        @Args({ name: 'id', type: () => Int }) patientId: number
    ): Promise<boolean> {
        return this.patientService.delete(patientId);
    }

}
