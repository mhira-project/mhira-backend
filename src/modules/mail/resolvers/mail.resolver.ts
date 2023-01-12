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
import { UsePermission } from 'src/modules/permission/decorators/permission.decorator';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';

@Resolver(() => MailTemplate)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class MailResolver {
    constructor(
        private readonly mailService: MailTemplateService,
        private readonly sendMailService: SendMailService
    ) {}

    @Query(() => MailTemplate)
    @UsePermission(PermissionEnum.VIEW_SETTINGS)
    async getEmailTemplate(
        @Args('id', { type: () => ID }) id: number,
    ): Promise<MailTemplate> {
        return await this.mailService.getEmailTemplate(id);
    }

    @Query(() => MailTemplateConnection)
    @UsePermission(PermissionEnum.VIEW_SETTINGS)
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
    @UsePermission(PermissionEnum.MANAGE_SETTINGS)
    async createEmailTemplate(
        @Args('input') input: CreateEmailTemplate,
    ): Promise<MailTemplate> {
        return this.mailService.createEmailTemplate(input);
    }

    @Mutation(() => Boolean)
    @UsePermission(PermissionEnum.MANAGE_SETTINGS)
    async deleteEmailTemplate(@Args('id') templateId: number) {
        return this.mailService.deleteEmailTemplate(templateId);
    }

    @Mutation(() => MailTemplate)
    @UsePermission(PermissionEnum.MANAGE_SETTINGS)
    async updateEmailTemplate(
        @Args('input') input: UpdateEmailTemplate,
    ): Promise<MailTemplate> {
        return this.mailService.updateEmailTemplate(input);
    }
}
