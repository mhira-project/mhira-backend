import { SetMetadata } from '@nestjs/common';

export const AllowUserType = (...types: string[]) => {
    return SetMetadata('userTypes', types);
};
