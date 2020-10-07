import { Module } from '@nestjs/common';
import { UserService } from './providers/user.service';
import { UserResolver } from './resolvers/user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repositories/user.repository';
import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { UserUpdateInput } from './dto/user-update.dto';
import { UserInput } from './dto/user.input';
import { User } from './models/user.model';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserRepository,
        ]),
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [NestjsQueryTypeOrmModule.forFeature([User])],
            // describe the resolvers you want to expose
            resolvers: [{
                DTOClass: User,
                EntityClass: User,
                CreateDTOClass: UserInput,
                UpdateDTOClass: UserUpdateInput,
            }],
        }),
    ],
    providers: [
        UserService,
        UserResolver,
    ],
    exports: [
        UserService
    ],
})
export class UserModule { }
