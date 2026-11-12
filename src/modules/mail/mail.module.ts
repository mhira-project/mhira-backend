import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { Module } from '@nestjs/common';
import { Assessment } from '../assessment/models/assessment.model';
import { GqlAuthGuard } from '../auth/auth.guard';
import { PermissionGuard } from '../permission/guards/permission.guard';
import { MailTemplate } from './models/mail-template.model';
import { MailResolver } from './resolvers/mail.resolver';
import { MailTemplateService } from './services/mail-template.service';
import { SendMailService } from './services/send-mail.service';
import { QuestionnaireModule } from '../questionnaire/questionnaire.module';

@Module({
  imports: [
    QuestionnaireModule,
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([
          MailTemplate,
          Assessment
        ]),
      ],
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
