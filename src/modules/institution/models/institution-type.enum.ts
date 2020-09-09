import { registerEnumType } from '@nestjs/graphql';

export enum InstitutionType {
    CLINIC = 'clinic',
    UNIVERSITY = 'university',
    OTHER = 'other',
}

registerEnumType(InstitutionType, {
    name: 'InstitutionType',
    description: "Possible Institution types; clinics, university, other",
});
