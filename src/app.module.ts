import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { configService } from './config/config.service';
import { AuthModule } from './modules/auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { formatError } from './shared/exception';
import { nullableDefaultedArguments } from './shared/graphql/nullable-defaulted-arguments';
import { PermissionModule } from './modules/permission/permission.module';
import { PatientModule } from './modules/patient/patient.module';
import { graphqlUploadExpress } from 'graphql-upload';
import { QuestionnaireModule } from './modules/questionnaire/questionnaire.module';
import { AssessmentModule } from './modules/assessment/assessment.module';
import { SettingModule } from './modules/setting/setting.module';
import { DepartmentModule } from './modules/department/department.module';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseConnectionFactory } from './config/mongoose-connection.factory';
import { CaregiverModule } from './modules/caregiver/caregiver.module';
import { ReportModule } from './modules/report/report.module';
import { DisclaimerModule } from './modules/disclaimer/disclaimer.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailModule } from './modules/mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        MailerModule.forRoot(configService.getMailerConfig()),
        // From Mongoose 6 every registered model's collection would be
        // created at start; v1.1.6 creates a collection with its first
        // document, so the empty ones (answers, choices, questions,
        // questiongroups, questionnaire_bundle) must not appear.
        MongooseModule.forRoot(configService.getMongoConnectionString(), {
            autoCreate: false,
            connectionFactory: mongooseConnectionFactory,
        }),
        TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            introspection: configService.isGraphqlPlaygroundEnabled(),
            playground: configService.isGraphqlPlaygroundEnabled(),
            autoSchemaFile: join(process.cwd(), 'src/schema/schema.gql'),
            context: ({ req }) => ({ req }),
            transformSchema: nullableDefaultedArguments,
            transformAutoSchemaFile: true,
            // The Apollo driver turns an HttpException into an Apollo error
            // for its status unless this is off (@nestjs/graphql 8 on);
            // v1.1.6 (7.x) leaves it to formatError below, and the clients
            // see that shape.
            autoTransformHttpErrors: false,
            includeStacktraceInErrorResponses: false,
            // v1.1.6 (Apollo 2) answers an operation that fails before it
            // runs, a variable coercion error among them, with HTTP 400;
            // Apollo 4 answers 200 unless this is on.
            status400ForVariableCoercionErrors: true,
            // Apollo 4 refuses requests a browser may send without a
            // preflight unless they carry one of these headers. A logged-in
            // client sends Authorization, which is not CORS-safelisted, so
            // it is a valid signal too; JSON requests need none (decision H).
            csrfPrevention: {
                requestHeaders: [
                    'x-apollo-operation-name',
                    'apollo-require-preflight',
                    'authorization',
                ],
            },
            formatError,
        }),
        UserModule,
        AuthModule,
        SharedModule,
        PermissionModule,
        PatientModule,
        AssessmentModule,
        SettingModule,
        DepartmentModule,
        QuestionnaireModule,
        CaregiverModule,
        ReportModule,
        DisclaimerModule,
        MailModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(graphqlUploadExpress()).forRoutes('graphql');
    }
}
