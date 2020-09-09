import { Module } from '@nestjs/common';
import { UserService } from './providers/user.service';
import { UserResolver } from './resolvers/user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repositories/user.repository';
import { InstitutionModule } from '../institution/institution.module';
import { AdminUserResolver } from './resolvers/admin-user.resolver';
import { AdminResolver } from './resolvers/admin.resolver';
import { AdminService } from './providers/admin.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserRepository,
        ]),
        InstitutionModule,
    ],
    providers: [
        UserService,
        AdminService,
        UserResolver,
        AdminUserResolver,
        AdminResolver,
    ],
    exports: [
        UserService
    ],
})
export class UserModule { }
