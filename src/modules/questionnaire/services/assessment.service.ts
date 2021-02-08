import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Answer } from '../models/answer.schema';
import { Assessment } from '../models/assessment.schema';

export class AssessmentService {
    constructor(
        @InjectModel(Assessment.name)
        private assessmentModel: Model<Assessment>,
        @InjectModel(Answer.name)
        private answerModel: Model<Answer>,
    ) {}

    createAssessment() {}
}
