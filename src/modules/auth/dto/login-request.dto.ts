import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class LoginRequestDto {

  @Field(() => String)
  identifier: string;

  @Field(() => String)
  password: string;
}
