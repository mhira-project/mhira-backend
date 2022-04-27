import { registerEnumType } from '@nestjs/graphql';

export enum AssessmentStatus {
    PLANNED = 'PLANNED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
    EXPIRED = 'EXPIRED',
    OPEN_FOR_COMPLETION = 'OPEN_FOR_COMPLETION',
}

registerEnumType(AssessmentStatus, { name: 'AssessmentStatus' });
