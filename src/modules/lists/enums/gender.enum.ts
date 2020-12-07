import { registerEnumType } from "@nestjs/graphql";

export enum GenderEnum {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

registerEnumType(GenderEnum, { name: 'Gender' });
