import { ArgsType, Field } from '@nestjs/graphql';
import { MaxLength } from 'class-validator';
import { IsOptional } from 'src/shared';

@ArgsType()
export class UserFilter {

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(30)
  searchKeyword: string;

}
