import { InputType, Field } from '@nestjs/graphql';
import { InstitutionType } from '../models/institution-type.enum';

@InputType()
export class InstitutionInput {
  @Field()
  name: string;

  @Field()
  type: InstitutionType;

  @Field({ nullable: true })
  code: string;

  @Field({ nullable: true })
  address: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  meta: string;
}
