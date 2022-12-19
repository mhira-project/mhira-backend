import { registerEnumType } from '@nestjs/graphql';

export enum TemplateModuleEnum {
    ASSESSMENT = 'ASSESSMENT',
    CLIENT = 'CLIENT',
}

registerEnumType(TemplateModuleEnum, { name: 'TemplateModule' });