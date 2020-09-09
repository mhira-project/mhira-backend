import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { InstitutionInput } from './institution.input';

@InputType()
export class InstitutionUpdateInput extends PartialType(InstitutionInput) {

}
