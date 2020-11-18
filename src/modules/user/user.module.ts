import { Module } from '@nestjs/common';
import { UserService } from './providers/user.service';
import { UserResolver } from './resolvers/user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repositories/user.repository';
import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { User } from './models/user.model';
import { UserCrudService } from './providers/user-crud.service';
import { UserCrudResolver } from './resolvers/user-crud.resolver';
import { SettingModule } from '../setting/setting.module';

@Module({
    imports: [
        SettingModule,
        TypeOrmModule.forFeature([
            UserRepository,
        ]),
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [NestjsQueryTypeOrmModule.forFeature([User])],
            // describe the resolvers you want to expose
            resolvers: [],
        }),
    ],
    providers: [
        UserService, // deprecated
        UserResolver, // deprecated
        UserCrudService,
        UserCrudResolver,
    ],
    exports: [
        UserService
    ],
})
export class UserModule { }
