import { SetMetadata } from '@nestjs/common';

export const isPublic = (params: boolean) => SetMetadata('isPublic', params);