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
import { ConsentModule } from './modules/consent/consent.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailModule } from './modules/mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TenancyMiddleware } from './modules/tenancy/tenancy.middleware';
import { TenancyModule } from './modules/tenancy/tenancy.module';

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
        TenancyModule,
        UserModule,
        AuthModule,
        SharedModule,
        PermissionModule,
        PatientModule,
        SettingModule,
        DepartmentModule,
        QuestionnaireModule,
        CaregiverModule,
        AssessmentModule,
        ReportModule,
        DisclaimerModule,
        ConsentModule,
        MailModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(TenancyMiddleware).forRoutes('*');
        consumer.apply(graphqlUploadExpress()).forRoutes('graphql');
    }
}
