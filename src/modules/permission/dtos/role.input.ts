import { InputType, Field } from '@nestjs/graphql';
import { MaxLength } from 'class-validator';

@InputType()
export class RoleInput {
    @MaxLength(15)
    @Field()
    name: string;
}
