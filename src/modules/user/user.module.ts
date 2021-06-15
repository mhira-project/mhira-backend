import { Injectable, Module } from '@nestjs/common';
import { Authorizer, NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { User } from './models/user.model';
import { UserCrudService } from './providers/user-crud.service';
import { UserCrudResolver } from './resolvers/user-crud.resolver';
import { SettingModule } from '../setting/setting.module';
import { ChangePasswordService } from './providers/change-password.service';
import { ChangePasswordResolver } from './resolvers/change-password.resolver';

@Injectable()
export class UserAuthorizer implements Authorizer<User> {
    async authorize() {
        return {};
    }

    async authorizeRelation() {
        return {};
    }
}

@Module({
    imports: [
        SettingModule,
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [NestjsQueryTypeOrmModule.forFeature([User])],
            // describe the resolvers you want to expose
            resolvers: [],
        }),
    ],
    providers: [
        UserCrudService,
        UserCrudResolver,
        ChangePasswordService,
        ChangePasswordResolver,
        UserAuthorizer,
    ],
})
export class UserModule { }
