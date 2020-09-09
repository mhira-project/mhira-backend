import { ArgsType, Field, Int } from '@nestjs/graphql';
import { MaxLength, IsOptional } from 'class-validator';

@ArgsType()
export class UserFilter {

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(30)
  searchKeyword: string;

}
