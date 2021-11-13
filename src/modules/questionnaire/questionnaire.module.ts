import { Module } from '@nestjs/common';
import { Answer, AnswerSchema } from './models/answer.schema';
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
    QuestionnaireVersion,
    QuestionnaireVersionSchema,
} from './models/questionnaire-version.schema';
import { QuestionnaireService } from './services/questionnaire.service';
import { QuestionnaireResolver } from './resolvers/questionnaire.resolver';
import { QuestionnaireAssessmentService } from './services/questionnaire-assessment.service';
import { AssessmentResolver } from './resolvers/assessment.resolver';
import {
    Questionnaire,
    QuestionnaireSchema,
} from './models/questionnaire.schema';
import {
    QuestionnaireAssessment,
    AssessmentSchema,
} from './models/questionnaire-assessment.schema';
import { NestjsQueryMongooseModule } from '@nestjs-query/query-mongoose';
import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { Xls2XformHelper } from './services/xls2xform';

@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            imports: [
                NestjsQueryMongooseModule.forFeature([
                    {
                        name: QuestionnaireVersion.name,
                        schema: QuestionnaireVersionSchema,
                        document: QuestionnaireVersion,
                    },
                    { name: Questionnaire.name, schema: QuestionnaireSchema, document: Questionnaire },
                    { name: Question.name, schema: QuestionSchema, document: Question },
                    { name: QuestionGroup.name, schema: QuestionGroupSchema, document: QuestionGroup },
                    { name: Answer.name, schema: AnswerSchema, document: Answer },
                    { name: Choice.name, schema: ChoiceSchema, document: Choice },
                    { name: QuestionnaireAssessment.name, schema: AssessmentSchema, document: QuestionnaireAssessment },
                ]),
            ],
            resolvers: [],
        })
    ],
    providers: [
        QuestionnaireService,
        QuestionnaireResolver,
        QuestionnaireAssessmentService,
        AssessmentResolver,
        Xls2XformHelper,
    ],
})
export class QuestionnaireModule { }
