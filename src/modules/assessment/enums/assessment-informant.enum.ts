import { registerEnumType } from '@nestjs/graphql';

export enum AssessmentInformant {
    PATIENT = 'PATIENT',
    USER = 'USER',
    CAREGIVER = 'CAREGIVER',
}

registerEnumType(AssessmentInformant, { name: 'AssessmentInformant' });
