import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { QuestionnaireScript } from './models/questionnaire-script.model';
import { QuestionnaireScriptsResolver } from './resolvers/questionnaire-script.resolver';
import { QuestionnaireScriptService } from './services/questionnaire-script.service';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { PermissionGuard } from '../permission/guards/permission.guard';
import { GqlAuthGuard } from '../auth/auth.guard';
import { Assessment } from '../assessment/models/assessment.model';
import {
    QuestionnaireBundle,
    QuestionnaireBundleSchema,
} from './models/questionnaire-bundle.schema';
import { QuestionnaireBundleResolver } from './resolvers/questionnaire-bundle.resolver';
import { QuestionnaireBundleService } from './services/questionnaire-bundle.service';

const guards = [GqlAuthGuard, PermissionGuard]; 

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Questionnaire.name,
                schema: QuestionnaireSchema,
            },
            {
                name: Question.name,
                schema: QuestionSchema,
            },
            {
                name: QuestionGroup.name,
                schema: QuestionGroupSchema,
            },
            {
                name: Answer.name,
                schema: AnswerSchema,
            },
            {
                name: Choice.name,
                schema: ChoiceSchema,
            },
            {
                name: QuestionnaireAssessment.name,
                schema: AssessmentSchema,
            },
            {
                name: QuestionnaireBundle.name,
                schema: QuestionnaireBundleSchema,
            },
        ]),
        NestjsQueryGraphQLModule.forFeature({
            imports: [
                NestjsQueryTypeOrmModule.forFeature([
                    QuestionnaireScript,
                    Assessment,
                ]),
            ],
            resolvers: [
                {
                    DTOClass: QuestionnaireScript,
                    EntityClass: QuestionnaireScript,
                    // guards,
                    read: {
                        disabled: true,
                    },
                    create: { disabled: true },
                    update: { disabled: true },
                    delete: { disabled: true },
                },
            ],
        }),
    ],
    providers: [
        QuestionnaireService,
        QuestionnaireScriptsResolver,
        QuestionnaireScriptService,
        QuestionnaireResolver,
        QuestionnaireAssessmentService,
        AssessmentResolver,
        QuestionnaireBundleResolver,
        QuestionnaireBundleService,
    ],
    exports: [QuestionnaireScriptService],
})
export class QuestionnaireModule {}
