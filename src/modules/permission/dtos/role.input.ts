import { InputType, Field } from '@nestjs/graphql';
import { Max, MaxLength, Min } from 'class-validator';
import { MAX_ROLE_HIERARCHY, MIN_ROLE_HIERARCHY } from '../constants';

@InputType()
export class RoleInput {
    @MaxLength(15)
    @Field()
    name: string;

    @Field()
    @Max(MAX_ROLE_HIERARCHY)
    @Min(MIN_ROLE_HIERARCHY)
    hierarchy: number;
}
