import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { CreateEmail, SendMailInput, UpdateEmail } from '../dtos/mail.dto';
import { Mail } from '../models/mail.model';
import { MailService } from '../services/mail.service';

@Resolver(() => Mail)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class MailResolver {
    constructor(private readonly mailService: MailService) {}

    @Mutation(() => String)
    async sendEmail(@Args('payload') payload: SendMailInput): Promise<string> {
        return this.mailService.sendEmail(payload)
    }

    @Mutation(() => Mail)
    async createEmailTemplate(@Args('input') input: CreateEmail): Promise<Mail> {
        return this.mailService.createEmailTemplate(input)
    }

    @Mutation(() => String)
    async deleteEmailTemplate(@Args('emailId') emailId: number) {
        return this.mailService.deleteEmailTemplate(emailId)
    }

    @Mutation(() => Mail)
    async updateEmailTemplate(@Args('input') input: UpdateEmail): Promise<Mail> {
        return this.mailService.updateEmailTemplate(input)
    }
}
