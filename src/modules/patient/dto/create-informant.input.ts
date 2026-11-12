import { InputType, PartialType } from '@nestjs/graphql';
import { Informant } from '../models/informant.model';

/**
 * The input of createOneInformant and createManyInformants, every field
 * optional as @nestjs-query built it up to v1.1.6; the fork builds it with
 * OmitType, which makes them required.
 */
@InputType('CreateInformant')
export class CreateInformantInput extends PartialType(Informant, InputType) {}
