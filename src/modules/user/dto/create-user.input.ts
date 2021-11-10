import { InputType, Field } from '@nestjs/graphql';
import { IsDate, IsEmail, IsLowercase, MaxDate, MinDate } from 'class-validator';
import * as moment from 'moment';
import { GenderEnum } from 'src/modules/patient/models/gender.enum';
import { IsOptional, IsPhoneNumber } from 'src/shared';

@InputType()
export class CreateUserInput {

  @IsLowercase()
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

  @IsOptional()
  @IsEmail()
  @Field({ nullable: true })
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  workID?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  gender?: GenderEnum;

  @IsOptional()
  @IsDate()
  @MinDate(moment('1900-01-01').toDate())
  @MaxDate(moment().toDate())
  @Field({ nullable: true })
  birthDate?: Date;

  @Field({ nullable: true })
  nationality?: string;
}
