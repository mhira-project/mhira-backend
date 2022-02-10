import { Resolver, Query, Args } from '@nestjs/graphql';
import { Assessment, FullAssessment } from '../models/assessment.model';
import { AssessmentService } from '../services/assessment.service';
import { UsePermission } from '../../permission/decorators/permission.decorator';
import { PermissionEnum } from '../../permission/enums/permission.enum';


@Resolver(() => Assessment)
export class PublicAssessmentResolver {
    constructor(
        private readonly assessmentService: AssessmentService,
    ) { }
    @Query(() => FullAssessment)
    @UsePermission(PermissionEnum.VIEW_ASSESSMENTS)
    getFullPublicAssessment(
        @Args('uuid', { type: () => String, nullable: true }) uuid: string,
    ): Promise<FullAssessment> {
        return this.assessmentService.getFullPublicAssessment(uuid);
    }

}
