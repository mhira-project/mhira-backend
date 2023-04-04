import { registerEnumType } from '@nestjs/graphql';

export enum AssessmentTypeEnum {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

registerEnumType(AssessmentTypeEnum, { name: 'AssessmentTypeEnum' });
