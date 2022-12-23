import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import {
    CreateEmailTemplate,
    UpdateEmailTemplate,
} from '../dtos/mail-template.dto';
import { MailTemplate } from '../models/mail-template.model';
import { MailTemplateService } from '../services/mail-template.service';
import {
    MailTemplateConnection,
    MailTemplateQuery,
} from '../dtos/mail-template.query';
import { ConnectionType } from '@nestjs-query/query-graphql';
import { SendMailService } from '../services/send-mail.service';

@Resolver(() => MailTemplate)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class MailResolver {
    constructor(
        private readonly mailService: MailTemplateService,
        private readonly sendMailService: SendMailService
    ) {}

    @Query(() => MailTemplate)
    async getEmailTemplate(
        @Args('id', { type: () => ID }) id: number,
    ): Promise<MailTemplate> {
        return await this.mailService.getEmailTemplate(id);
    }

    @Query(() => MailTemplateConnection)
    async getAllEmailTemplates(
        @Args({ type: () => MailTemplateQuery }) query: MailTemplateQuery,
    ): Promise<ConnectionType<MailTemplate>> {
        return this.mailService.getAllEmailTemplates(query);
    }

    @Mutation(() => Boolean)
    async sendAssessmentEmail(
        @Args('assessmentId', { type: () => ID }) assessmentId: number 
    ) {
        return this.sendMailService.sendAssessmentEmail(assessmentId)
    }


    @Mutation(() => MailTemplate)
    async createEmailTemplate(
        @Args('input') input: CreateEmailTemplate,
    ): Promise<MailTemplate> {
        return this.mailService.createEmailTemplate(input);
    }

    @Mutation(() => Boolean)
    async deleteEmailTemplate(@Args('id') templateId: number) {
        return this.mailService.deleteEmailTemplate(templateId);
    }

    @Mutation(() => MailTemplate)
    async updateEmailTemplate(
        @Args('input') input: UpdateEmailTemplate,
    ): Promise<MailTemplate> {
        return this.mailService.updateEmailTemplate(input);
    }
}
