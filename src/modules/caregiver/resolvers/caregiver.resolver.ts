import { QueryArgsType } from "@nestjs-query/query-graphql";
import { UseGuards } from "@nestjs/common";
import { Args, ArgsType, Resolver, Query } from "@nestjs/graphql";
import { GqlAuthGuard } from "src/modules/auth/auth.guard";
import { PermissionGuard } from "src/modules/permission/guards/permission.guard";
import { Caregiver } from "../models/caregiver.model";
import { CaregiverService } from "../services/caregiver.service";
import { SortDirection } from '@nestjs-query/core';
import { PermissionEnum } from "src/modules/permission/enums/permission.enum";
import { UsePermission } from "src/modules/permission/decorators/permission.decorator";

@ArgsType()
class CaregiverQuery extends QueryArgsType(Caregiver) { }

const CaregiverConnection = CaregiverQuery.ConnectionType;

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
}
