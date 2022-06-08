import { UseGuards } from '@nestjs/common';
import {
    Resolver,
    Query,
    Int,
    Args,
    Mutation,
    ResolveField,
    Parent,
    ID,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import {
    AssessmentTypeConnection,
    AssessmentTypeQuery,
} from '../dtos/assessment-type.query';
import { AssessmentType } from '../models/assessment-type.model';
import { Assessment, FullAssessment } from '../models/assessment.model';
import { AssessmentTypeService } from '../services/assessment-type.service';
import { AssessmentService } from '../services/assessment.service';
import { ConnectionType } from '@nestjs-query/query-graphql';
import {
    CreateAssessmentTypeInput,
    UpdateAssessmentTypeInput,
} from '../dtos/create-assessment-type.input';

@Resolver(() => AssessmentType)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class AssessmentTypeResolver {
    constructor(
        private readonly assessmentTypeService: AssessmentTypeService,
    ) {}

    @Query(() => AssessmentTypeConnection)
    // @UsePermission(PermissionEnum.VIEW_ASSESSMENTS)
    async assessmentTypes(
        @Args({ type: () => AssessmentTypeQuery }) query: AssessmentTypeQuery,
    ): Promise<ConnectionType<AssessmentType>> {
        return this.assessmentTypeService.getAssessmentTypes(query);
    }

    @Query(() => [AssessmentType])
    // @UsePermission(PermissionEnum.VIEW_ASSESSMENTS)
    async activeAssessmentTypes(): Promise<AssessmentType[]> {
        return this.assessmentTypeService.getActiveAssessmentTypes();
    }

    @Mutation(() => AssessmentType)
    // @UsePermission(PermissionEnum.MANAGE_ASSESSMENTS)
    createNewAssessmentType(
        @Args('assessmentType') assessmentTypeInput: CreateAssessmentTypeInput,
    ) {
        return this.assessmentTypeService.createAssessmentType(
            assessmentTypeInput,
        );
    }

    @Mutation(() => AssessmentType)
    // @UsePermission(PermissionEnum.MANAGE_ASSESSMENTS)
    updateAssessmentType(
        @Args('assessmentType') assessmentTypeInput: UpdateAssessmentTypeInput,
    ) {
        return this.assessmentTypeService.updateAssessmentType(
            assessmentTypeInput,
        );
    }

    @Mutation(() => Boolean)
    // @UsePermission(PermissionEnum.MANAGE_ASSESSMENTS)
    deleteAssessmentType(@Args('id') assessmentTypeId: number) {
        return this.assessmentTypeService.deleteAssessmentType(
            assessmentTypeId,
        );
    }
}
