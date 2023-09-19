import { Resolver, Query, Args } from '@nestjs/graphql';
import { Assessment, FullPublicAssessment } from '../models/assessment.model';
import { AssessmentService } from '../services/assessment.service';

@Resolver(() => Assessment)
export class PublicAssessmentResolver {
    constructor(
        private readonly assessmentService: AssessmentService,
    ) { }
    @Query(() => FullPublicAssessment)
    getFullPublicAssessment(
        @Args('uuid', { type: () => String }) uuid: string,
    ): Promise<FullPublicAssessment> {
        return this.assessmentService.getFullPublicAssessment(uuid);
    }

}