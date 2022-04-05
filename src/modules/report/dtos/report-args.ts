import { QueryArgsType, QueryOptions } from '@nestjs-query/query-graphql';
import { ArgsType } from '@nestjs/graphql';
import { Report } from '../models/report.model';

@ArgsType()
export class ReportQuery extends QueryArgsType(Report) {}

export const ReportQueryConnection = ReportQuery.ConnectionType;
