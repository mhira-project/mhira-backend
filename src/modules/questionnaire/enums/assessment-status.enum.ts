import { registerEnumType } from '@nestjs/graphql';

export enum AssessmentStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
  EXPIRED = 'EXPIRED',
  ARCHIVED = 'ARCHIVED',
}

registerEnumType(AssessmentStatus, { name: 'AssessmentStatus' });