import { registerEnumType } from '@nestjs/graphql';

export enum AssessmentEmailStatus {
    SCHEDULED = 'SCHEDULED',
    NOT_SCHEDULED = 'NOT_SCHEDULED',
    SENT = 'SENT',
    NOT_SENT = 'NOT_SENT',
    FAILED = 'FAILED',
}

registerEnumType(AssessmentEmailStatus, { name: 'AssessmentEmailStatus' });