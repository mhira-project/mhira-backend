import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { configService } from './config/config.service';
import { AuthModule } from './modules/auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { PermissionModule } from './modules/permission/permission.module';
import { PatientModule } from './modules/patient/patient.module';
import { GraphQLError } from 'graphql';
import { graphqlUploadExpress } from 'graphql-upload';
import { QuestionnaireModule } from './modules/questionnaire/questionnaire.module';
import { AssessmentModule } from './modules/assessment/assessment.module';
import { SettingModule } from './modules/setting/setting.module';
import { DepartmentModule } from './modules/department/department.module';
import { MongooseModule } from '@nestjs/mongoose';
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
        MongooseModule.forRoot(configService.getMongoConnectionString(), {
            useFindAndModify: false,
        }),
        TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
        GraphQLModule.forRoot({
            introspection: configService.isGraphqlPlaygroundEnabled(),
            playground: configService.isGraphqlPlaygroundEnabled(),
            autoSchemaFile: join(process.cwd(), 'src/schema/schema.gql'),
            context: ({ req }) => ({ req }),
            debug: false, // disables stack trace
            uploads: false,
            formatError: (error: GraphQLError) => {
                if (typeof error.message === 'string') {
                    return new GraphQLError(
                        error.message,
                        null,
                        null,
                        null,
                        error.path,
                        error,
                        error.extensions,
                    );
                }
                return new GraphQLError(
                    error.message['message'],
                    null,
                    null,
                    null,
                    error.path,
                    error,
                    error.extensions,
                );
            },
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
