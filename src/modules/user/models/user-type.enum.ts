import { registerEnumType } from '@nestjs/graphql';

export enum UserType {
    USER = 'user', // institution users, including instution admins
    ADMIN = 'admin', // platform admins
}

registerEnumType(UserType, {
    name: 'UserType',
    description: "All possible User types; USER, ADMIN",
});
