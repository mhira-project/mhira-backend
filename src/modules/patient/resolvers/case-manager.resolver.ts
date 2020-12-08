import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard } from "src/modules/auth/auth.guard";
import { UserConnectionDto } from "src/modules/user/dto/user-connection.model";
import { CaseManagerFilter } from "../dto/case-manager.filter";
import { Patient } from "../models/patient.model";
import { CaseManagerService } from "../providers/case-manager.service";

@Resolver(() => Patient)
@UseGuards(GqlAuthGuard)
export class CaseManagerResolver {

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


    @Query(() => UserConnectionDto)
    getPatientCaseManagers(
        @Args() caseManagerFilter: CaseManagerFilter,
    ): Promise<UserConnectionDto> {
        return this.caseManagerService.getPatientCaseManagers(caseManagerFilter);
    }
}
