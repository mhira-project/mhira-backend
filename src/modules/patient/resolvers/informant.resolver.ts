import { UseGuards } from '@nestjs/common';
import { Args, ArgsType, Query, Resolver } from '@nestjs/graphql';
import { InjectQueryService, QueryService } from '@ptc-org/nestjs-query-core';
import { FindOneArgsType } from '@ptc-org/nestjs-query-graphql';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { UsePermission } from 'src/modules/permission/decorators/permission.decorator';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { Informant } from '../models/informant.model';

@ArgsType()
class FindOneInformantArgs extends FindOneArgsType(Informant) {}

/**
 * `informant(id)` as `@nestjs-query` generated it up to v1.1.6: `null` when
 * no informant has the id. The fork's generated find-by-id (from
 * `@ptc-org/nestjs-query-graphql` 0.33) throws instead and makes the result
 * non-null, so this query is written here with the generated one's
 * arguments, guards and permission.
 */
@Resolver(() => Informant)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class InformantResolver {
    constructor(
        @InjectQueryService(Informant)
        private readonly service: QueryService<Informant>,
    ) {}

    @Query(() => Informant, { nullable: true })
    @UsePermission(PermissionEnum.VIEW_PATIENTS)
    informant(
        @Args() { id }: FindOneInformantArgs,
    ): Promise<Informant | undefined> {
        return this.service.findById(id);
    }
}
