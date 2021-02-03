import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GqlAuthGuard } from '../auth/auth.guard';
import {
    Answer,
    DateAnswer,
    DateAnswerSchema,
    MultipleChoiceAnswer,
    MultipleChoiceAnswerSchema,
    NumericAnswer,
    NumericAnswerSchema,
    TextAnswer,
    TextAnswerSchema,
} from './models/answer.schema';
import {
    QuestionGroup,
    QuestionGroupSchema,
} from './models/question-group.schema';
import {
    Choice,
    ChoiceSchema,
    Question,
    QuestionSchema,
} from './models/question.schema';
import {
    Questionnaire,
    QuestionnaireSchema,
} from './models/questionnaire.schema';
import { QuestionnaireService } from './services/questionnaire.service';
import { QuestionnaireResolver } from './resolvers/questionnaire.resolver';

const guards = [GqlAuthGuard];
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Questionnaire.name, schema: QuestionnaireSchema },
            { name: Question.name, schema: QuestionSchema },
            { name: QuestionGroup.name, schema: QuestionGroupSchema },
            { name: Questionnaire.name, schema: QuestionnaireSchema },
            { name: TextAnswer.name, schema: TextAnswerSchema },
            { name: NumericAnswer.name, schema: NumericAnswerSchema },
            {
                name: MultipleChoiceAnswer.name,
                schema: MultipleChoiceAnswerSchema,
            },
            { name: DateAnswer.name, schema: DateAnswerSchema },
            { name: Choice.name, schema: ChoiceSchema },
        ]),
    ],
    providers: [QuestionnaireService, QuestionnaireResolver],
})
export class QuestionnaireModule {}
