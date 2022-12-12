import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { CreateEmailTemplate, SendMailInput, UpdateEmailTemplate } from '../dtos/mail-template.dto';
import { MailTemplate } from '../models/mail-template.model';
import { MailService } from '../services/mail.service';

@Resolver(() => MailTemplate)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class MailResolver {
    constructor(private readonly mailService: MailService) {}
    
    @Mutation(() => String)
    async sendEmail(@Args('payload') payload: SendMailInput): Promise<string> {
        return this.mailService.sendEmail(payload)
    }

    @Query(() => MailTemplate)
    async getEmailTemplate(@Args('id', { type: () => ID }) id: number): Promise<MailTemplate> {
        return await this.mailService.getEmailTemplate(id)
    }

    @Query(() => [MailTemplate])
    async getAllEmailTemplates(): Promise<MailTemplate[]> {
        return this.mailService.getAllEmailTemplates()
    }

    @Mutation(() => MailTemplate)
    async createEmailTemplate(@Args('input') input: CreateEmailTemplate): Promise<MailTemplate> {
        return this.mailService.createEmailTemplate(input)
    }

    @Mutation(() => String)
    async deleteEmailTemplate(@Args('emailId') emailId: number) {
        return this.mailService.deleteEmailTemplate(emailId)
    }

    @Mutation(() => MailTemplate)
    async updateEmailTemplate(@Args('input') input: UpdateEmailTemplate): Promise<MailTemplate> {
        return this.mailService.updateEmailTemplate(input)
    }
}
