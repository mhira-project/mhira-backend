import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class InstitutionFilter {

  @Field({ nullable: true })
  searchKeyword: string;

}
