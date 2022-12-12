import { registerEnumType } from '@nestjs/graphql';

export enum MailModule {
    ASSESSMENT = 'ASSESSMENT',
    CLIENT = 'CLIENT',
}

registerEnumType(MailModule, { name: 'MailModule' });