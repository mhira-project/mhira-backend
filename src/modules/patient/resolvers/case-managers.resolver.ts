import { NotImplementedException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard } from "src/modules/auth/auth.guard";
import { UserConnectionDto } from "src/modules/user/dto/user-connection.model";
import { PaginationArgs } from "src/shared/pagination/types/pagination.args";
import { CaseManagerFilter } from "../dto/case-manager.filter";
import { Patient } from "../models/patient.model";
import { CaseManagerService } from "../providers/case-manager.service";

@Resolver(() => Patient)
@UseGuards(GqlAuthGuard)
export class PatientClinicianResolver {

    constructor(
        private readonly caseManagerService: CaseManagerService,
    ) { }

    @Mutation(() => Boolean)
    assignPatientCaseManager(
        @Args({ name: 'patientId', type: () => Int }) patientId: number,
        @Args({ name: 'userId', type: () => Int }) clinicianId: number,
    ): Promise<boolean> {

        return this.caseManagerService.assignPatientCaseManager(patientId, clinicianId);
    }

    @Mutation(() => Boolean)
    unassignPatientCaseManager(
        @Args({ name: 'patientId', type: () => Int }) patientId: number,
        @Args({ name: 'userId', type: () => Int }) clinicianId: number,
    ): Promise<boolean> {
        return this.caseManagerService.unassignPatientCaseManager(patientId, clinicianId);
    }

    @Mutation(() => Boolean)
    assignPatientInformant(
        @Args({ name: 'patientId', type: () => Int }) patientId: number,
        @Args({ name: 'userId', type: () => Int }) informantId: number,
    ): Promise<boolean> {
        return this.caseManagerService.assignPatientInformant(patientId, informantId);
    }

    @Mutation(() => Boolean)
    unassignPatientInformant(
        @Args({ name: 'patientId', type: () => Int }) patientId: number,
        @Args({ name: 'userId', type: () => Int }) informantId: number,
    ): Promise<boolean> {
        return this.caseManagerService.unassignPatientInformant(patientId, informantId);
    }

    @Query(() => UserConnectionDto)
    getPatientCaseManagers(
        @Args() caseManagerFilter: CaseManagerFilter,
    ): Promise<UserConnectionDto> {
        return this.caseManagerService.getPatientCaseManagers(caseManagerFilter);
    }

    @Query(() => UserConnectionDto)
    getPatientInformants(
        @Args({ name: 'patientId', type: () => Int }) patientId: number,
        @Args() paginationArgs: PaginationArgs,
    ): Promise<UserConnectionDto> {
        return this.caseManagerService.getPatientInformants(patientId, paginationArgs);
    }

}
