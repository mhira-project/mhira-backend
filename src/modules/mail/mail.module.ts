import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { PermissionGuard } from '../permission/guards/permission.guard';
import { Mail } from './models/mail.model';
import { MailResolver } from './resolvers/mail.resolver';
import { MailService } from './services/mail.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([
          Mail
        ])
      ],
      services: [MailService],
      resolvers: [
        {
          DTOClass: Mail,
          EntityClass: Mail,
          guards: [GqlAuthGuard, PermissionGuard],
          read: { disabled: true },
          create: { disabled: true },
          update: { disabled: true },
          delete: { disabled: true },
        }
      ],
    }),
  ],
  providers: [MailResolver, MailService]
})
export class MailModule {}
