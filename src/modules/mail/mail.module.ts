import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { Assessment } from '../assessment/models/assessment.model';
import { GqlAuthGuard } from '../auth/auth.guard';
import { PermissionGuard } from '../permission/guards/permission.guard';
import { MailTemplate } from './models/mail-template.model';
import { MailResolver } from './resolvers/mail.resolver';
import { MailTemplateService } from './services/mail-template.service';
import { SendMailService } from './services/send-mail.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([
          MailTemplate,
          Assessment
        ])
      ],
      services: [MailTemplateService, SendMailService],
      resolvers: [
        {
          DTOClass: MailTemplate,
          EntityClass: MailTemplate,
          guards: [GqlAuthGuard, PermissionGuard],
          read: { disabled: true },
          create: { disabled: true },
          update: { disabled: true },
          delete: { disabled: true },
        }
      ],
    }),
  ],
  providers: [MailResolver, MailTemplateService, SendMailService]
})
export class MailModule {}
