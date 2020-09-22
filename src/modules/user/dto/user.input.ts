import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsPhoneNumber } from 'class-validator';
import { GenderEnum } from 'src/modules/patient/models/gender.enum';

@InputType()
export class UserInput {

  @Field()
  username: string;

  @Field()
  password: string;

  @Field({ nullable: true, defaultValue: true })
  active: boolean;

  @Field()
  firstName: string;

  @Field({ nullable: true })
  middleName?: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  email?: string;

  @IsOptional()
  @IsPhoneNumber('TZ')
  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  workID?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  gender?: GenderEnum;

  @Field({ nullable: true })
  birthDate?: Date;

  @Field({ nullable: true })
  nationality?: string;
}
