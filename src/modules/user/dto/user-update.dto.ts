import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { UserInput } from './user.input';

@InputType()
export class UserUpdateInput extends PartialType(OmitType(UserInput, ['password'] as const)) {

}
