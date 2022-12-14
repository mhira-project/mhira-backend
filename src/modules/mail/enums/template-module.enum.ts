import { registerEnumType } from '@nestjs/graphql';

export enum TemplateModule {
    ASSESSMENT = 'ASSESSMENT',
    CLIENT = 'CLIENT',
}

registerEnumType(TemplateModule, { name: 'TemplateModule' });