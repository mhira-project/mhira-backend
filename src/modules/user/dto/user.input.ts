import { InputType, Field } from '@nestjs/graphql';
import { IsPhoneNumber, IsDefined, IsOptional } from 'class-validator';

@InputType()
export class UserInput {

  @IsDefined()
  @Field()
  email: string;

  @IsDefined()
  @Field()
  password: string;

  @IsDefined()
  @Field()
  name: string;

  @IsOptional()
  @IsPhoneNumber('TZ')
  @Field({ nullable: true })
  phone?: string;

  // @Field({ nullable: true })
  // institutionId: number;
}
