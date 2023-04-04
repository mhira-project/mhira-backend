import { QueryArgsType } from '@nestjs-query/query-graphql';
import { ArgsType } from '@nestjs/graphql';
import { AssessmentType } from '../models/assessment-type.model';

@ArgsType()
export class AssessmentTypeQuery extends QueryArgsType(AssessmentType) {}

export const AssessmentTypeConnection = AssessmentTypeQuery.ConnectionType;
