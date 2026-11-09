import { Module } from '@nestjs/common';
import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './models/user.model';
import { UserCrudService } from './providers/user-crud.service';
import { UserCrudResolver } from './resolvers/user-crud.resolver';
import { SettingModule } from '../setting/setting.module';
import { ChangePasswordService } from './providers/change-password.service';
import { ChangePasswordResolver } from './resolvers/change-password.resolver';

@Module({
    imports: [
        SettingModule,
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [NestjsQueryTypeOrmModule.forFeature([User])],
            // describe the resolvers you want to expose
            resolvers: [],
            // UserCrudResolver is written by hand; this registers the
            // providers its CRUDResolver needs (the User authorizer)
            dtos: [
                {
                    DTOClass: User,
                    CreateDTOClass: CreateUserInput,
                    UpdateDTOClass: UpdateUserInput,
                },
            ],
        }),
    ],
    providers: [
        UserCrudService,
        UserCrudResolver,
        ChangePasswordService,
        ChangePasswordResolver,
    ],
})
export class UserModule { }
