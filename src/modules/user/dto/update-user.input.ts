import { UpdateOneInputType } from '@nestjs-query/query-graphql';
import { Field, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { User } from '../models/user.model';
import { CreateUserInput } from './create-user.input';

@InputType()
export class UpdateUserInput extends PartialType(
    OmitType(CreateUserInput, ['password'] as const),
) {
    @Field({ nullable: true })
    acceptedTerm: boolean;
}
