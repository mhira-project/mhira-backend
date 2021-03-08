import { SetMetadata } from '@nestjs/common';

export const AllowRoleType = (...types: string[]) => {
    return SetMetadata('userTypes', types);
};
