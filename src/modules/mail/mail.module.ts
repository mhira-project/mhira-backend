import { Module } from '@nestjs/common';
import { MailResolver } from './resolvers/mail.resolver';
import { MailService } from './providers/mail.service';

@Module({
  providers: [MailResolver, MailService]
})
export class MailModule {}
