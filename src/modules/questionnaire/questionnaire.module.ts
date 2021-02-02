import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GqlAuthGuard } from '../auth/auth.guard';
import { Answer, AnswerSchema } from './models/answer.model';
import {
    QuestionGroup,
    QuestionGroupSchema,
} from './models/question-group.model';
import {
    Choice,
    ChoiceSchema,
    Question,
    QuestionSchema,
} from './models/question.model';
import {
    Questionnaire,
    QuestionnaireSchema,
} from './models/questionnaire.schema.model';
import { Translation, TranslationSchema } from './models/translation.model';

const guards = [GqlAuthGuard];
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Questionnaire.name, schema: QuestionnaireSchema },
            { name: QuestionGroup.name, schema: QuestionGroupSchema },
            { name: Question.name, schema: QuestionSchema },
            { name: Answer.name, schema: AnswerSchema },
            { name: Choice.name, schema: ChoiceSchema },
            { name: Translation.name, schema: TranslationSchema },
        ]),
    ],
})
export class QuestionnaireModule {}
