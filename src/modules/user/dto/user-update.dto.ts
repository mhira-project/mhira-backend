import { InputType, OmitType } from '@nestjs/graphql';
import { UserInput } from './user.input';

@InputType()
export class UserUpdateInput extends OmitType(UserInput, ['password'] as const) {

}
