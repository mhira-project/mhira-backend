import { Module } from '@nestjs/common';
import { UserService } from './providers/user.service';
import { UserResolver } from './resolvers/user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repositories/user.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserRepository,
        ]),
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
