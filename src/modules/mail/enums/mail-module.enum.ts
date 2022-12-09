import { registerEnumType } from '@nestjs/graphql';

export enum MailModule {
    ACTIVE = 'ACTIVE',
    ASSESSMENT = 'ASSESSMENT',
    CLIENT = 'CLIENT',
}

registerEnumType(MailModule, { name: 'MailModule' });