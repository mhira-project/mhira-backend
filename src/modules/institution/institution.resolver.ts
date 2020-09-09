import { Resolver, Query, Args, Mutation, Int } from '@nestjs/graphql';
import { Institution } from './models/institution.model';
import { InstitutionFilter } from './dto/institution.filter';
import { InstitutionInput } from './dto/institution.input';
import { InstitutionService } from './institution.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { InstitutionUpdateInput } from './dto/institution-update.dto';
import { PaginatedInstitution } from './dto/paginated-institution.model';
import { PaginationArgs } from 'src/shared/pagination/types/pagination.args';
import { UserTypeGuard } from '../permission/guards/user-type.guard';
import { AllowUserType } from '../permission/decorators/user-type.decorator';
import { UserType } from '../user/models/user-type.enum';

@UseGuards(GqlAuthGuard, UserTypeGuard)
@AllowUserType(UserType.ADMIN)
@Resolver(() => Institution)
export class InstitutionResolver {
    constructor(private readonly institutionService: InstitutionService) { }

    @Query(() => PaginatedInstitution, { name: 'ADMIN_getInstitutions' })
    async getInstitutions(
        @Args() paginationArgs: PaginationArgs,
        @Args() filter: InstitutionFilter,
    ): Promise<PaginatedInstitution> {
        return this.institutionService.getAllInstitutions(paginationArgs, filter);
    }

    @Mutation(() => Institution, { name: 'ADMIN_createInstitution' })
    createInstitution(
        @Args('input') institutionData: InstitutionInput,
    ): Promise<Institution> {
        return this.institutionService.createInstitution(institutionData);
    }

    @Mutation(() => Institution, { name: 'ADMIN_updateInstitution' })
    updateInstitution(
        @Args({ name: 'id', type: () => Int }) id: number,
        @Args('input') institutionData: InstitutionUpdateInput,
    ): Promise<Institution> {
        return this.institutionService.updateInstitution(id, institutionData);
    }

    @Mutation(() => Boolean, { name: 'ADMIN_deleteInstitution' })
    deleteInstitution(
        @Args('id') id: number,
    ): Promise<boolean> {
        return this.institutionService.deleteInstitution(id);
    }
}
