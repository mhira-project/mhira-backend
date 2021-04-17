import { SetMetadata } from '@nestjs/common';

export const UsePermission = (permissions: string | string[]) => {
    return SetMetadata('permissions', permissions);
};

export const UseOrPermissions = (permissions: string | string[]) => {
    return SetMetadata('or_permissions', permissions);
};
