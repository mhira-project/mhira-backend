import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { configService } from './config/config.service';
import { AuthModule } from './modules/auth/auth.module';
import { GraphQLError } from 'graphql';
import { SharedModule } from './shared/shared.module';
import { PermissionModule } from './modules/permission/permission.module';
import { PatientModule } from './modules/patient/patient.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
        GraphQLModule.forRoot({
            autoSchemaFile: join(process.cwd(), 'src/schema/schema.gql'),
            context: ({ req }) => ({ req }),
            formatError: (error: GraphQLError) => {
                if (typeof error.message === 'string') {
                    return new GraphQLError(error.message);
                }
                return new GraphQLError(error.message['message']);
            },
        }),
        UserModule,
        AuthModule,
        SharedModule,
        PermissionModule,
        PatientModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
