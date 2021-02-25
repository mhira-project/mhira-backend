import { registerEnumType } from "@nestjs/graphql";

export enum GuardType {
    USER = 'user', // institution users, including instution admins
    ADMIN = 'admin', // platform admins
}

registerEnumType(GuardType, { name: 'GuardType' });
