import { CreateOneInputType, QueryArgsType } from "@nestjs-query/query-graphql";
import { UseGuards } from "@nestjs/common";
import { Args, ArgsType, Resolver, Query, InputType, Mutation } from "@nestjs/graphql";
import { GqlAuthGuard } from "src/modules/auth/auth.guard";
import { PermissionGuard } from "src/modules/permission/guards/permission.guard";
import { Caregiver } from "../models/caregiver.model";
import { CaregiverService } from "../services/caregiver.service";
import { SortDirection } from '@nestjs-query/core';
import { PermissionEnum } from "src/modules/permission/enums/permission.enum";
import { UsePermission } from "src/modules/permission/decorators/permission.decorator";
import { CaregiverInput } from "../dtos/caregiver.input";


@ArgsType()
class CaregiverQuery extends QueryArgsType(Caregiver) { }

const CaregiverConnection = CaregiverQuery.ConnectionType;
@InputType()
export class CreateOneCaregiverInput extends CreateOneInputType('caregiver', CaregiverInput) { }

@Resolver(() => Caregiver)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class CaregiverResolver {
    constructor(
        private readonly caregiverService: CaregiverService

    ) { }

    @UsePermission(PermissionEnum.VIEW_PATIENTS)
    @Query(() => [CaregiverConnection])
    async caregivers(
        @Args({ type: () => CaregiverQuery }) query: CaregiverQuery,
    ): Promise<any> {
        query.sorting = query.sorting?.length
            ? query.sorting
            : [{ field: 'id', direction: SortDirection.DESC }];
        return CaregiverConnection.createFromPromise(
            (q) => this.caregiverService.query(q),
            query,
            (q) => this.caregiverService.count(q),

        );
    }

    @Mutation(() => Caregiver)
    @UsePermission(PermissionEnum.MANAGE_CAREGIVERS)
    async createOneCaregiver(@Args('input', { type: () => CreateOneCaregiverInput }) input: CreateOneCaregiverInput): Promise<Caregiver> {
        try {
            const caregiverInput = input['caregiver'] as CaregiverInput;
            return await this.caregiverService.insert(caregiverInput)
        } catch (error) {
            error.message = error.message === 'Conflict' ? 'This caregiver number has already been registered!' : error.message;
            return error
        }

    }
}

