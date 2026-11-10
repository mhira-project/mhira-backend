import { QueryArgsType } from "@ptc-org/nestjs-query-graphql";
import { ArgsType } from "@nestjs/graphql";
import { Assessment } from "../models/assessment.model";


@ArgsType()
export class AssessmentQuery extends QueryArgsType(Assessment) { }

export const AssessmentConnection = AssessmentQuery.ConnectionType;
