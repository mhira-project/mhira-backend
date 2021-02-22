import { registerEnumType } from "@nestjs/graphql";

export enum RoleCode {
    SUPER_ADMIN = 'SUPER_ADMIN',
    NO_ROLE = 'NO_ROLE',
}

registerEnumType(RoleCode, { name: 'RoleCode' });
