import { MailerService } from '@nestjs-modules/mailer';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { SendMailInput } from '../dtos/mail.dto';

@Resolver()
export class MailResolver {
    constructor(private mailService: MailerService) {}

    @Mutation(() => String)
    async sendEmail(@Args('payload') payload: SendMailInput): Promise<string> {
        await this.mailService.sendMail({
          to: payload.to,
          from: payload.from,
          subject: payload.subject,
          template: 'test',
          context: {
            test: payload
          }
        })
        return 'success'
    }
}
