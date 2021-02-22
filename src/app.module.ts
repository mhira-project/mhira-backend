import { Module } from '@nestjs/common';
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
import { QuestionnaireModule } from './modules/questionnaire/questionnaire.module';
import { AssessmentModule } from './modules/assessment/assessment.module';
import { SettingModule } from './modules/setting/setting.module';
import { DepartmentModule } from './modules/department/department.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Upload } from './modules/questionnaire/types/upload.type';
import { GraphQLUpload } from 'graphql-tools';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/questionnaireDB'),
        TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
        GraphQLModule.forRoot({
            autoSchemaFile: join(process.cwd(), 'src/schema/schema.gql'),
            context: ({ req }) => ({ req }),
            debug: false, // disables stack trace
            uploads: {
                maxFileSize: 20000000, // 20 MB
                maxFiles: 1,
            },
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
    ],
    controllers: [],
    providers: [Upload],
})
export class AppModule {}
