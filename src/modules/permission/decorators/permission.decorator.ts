import { SetMetadata } from '@nestjs/common';

export const UsePermission = (permissions: string | string[]) => {
    return SetMetadata('permissions', permissions);
};
