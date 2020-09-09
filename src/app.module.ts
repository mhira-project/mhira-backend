import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { configService } from './config/config.service';
import { AuthModule } from './modules/auth/auth.module';
import { GraphQLError } from 'graphql';
import { InstitutionModule } from './modules/institution/institution.module';
import { SharedModule } from './shared/shared.module';
import { PermissionModule } from './modules/permission/permission.module';

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
        InstitutionModule,
        AuthModule,
        SharedModule,
        PermissionModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
