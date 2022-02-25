import { UseGuards } from "@nestjs/common";
import { Args, ArgsType, Resolver, Query, InputType, Mutation } from "@nestjs/graphql";
import { GqlAuthGuard } from "src/modules/auth/auth.guard";
import { PermissionGuard } from "src/modules/permission/guards/permission.guard";
import { PermissionEnum } from "src/modules/permission/enums/permission.enum";
import { UsePermission } from "src/modules/permission/decorators/permission.decorator";
import { PatientCaregiver } from "../models/patient-caregiver.model";
import { PatientCaregiverService } from "../services/patient.caregiver.service";
import { CreateOneInputType } from "@nestjs-query/query-graphql";
import { PatientCaregiverInput } from "../dtos/patient.caregiver.input";

@InputType()
export class CreateOnePatientCaregiverInput extends CreateOneInputType('patientCaregiver', PatientCaregiverInput) { }

@Resolver(() => PatientCaregiver)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class PatientCaregiverResolver {
    constructor(
        private readonly patinetCaregiverService: PatientCaregiverService

    ) { }

    @Mutation(() => PatientCaregiver)
    @UsePermission(PermissionEnum.MANAGE_CAREGIVERS)
    async createOnePatientCaregiver(
        @Args('input', { type: () => CreateOnePatientCaregiverInput }) input: CreateOnePatientCaregiverInput,
    ): Promise<PatientCaregiver> {
        try {
            const caregiverInput = input['patientCaregiver'] as PatientCaregiverInput;
            return await this.patinetCaregiverService.insert(caregiverInput)
        } catch (error) {
            error.message = error.message === 'Conflict' ? 'Caregiver with this number already exists. Use the previous menu to add an existing caregiver or update number to create new one.' : error.message;
            return error;
        }
    }
}


