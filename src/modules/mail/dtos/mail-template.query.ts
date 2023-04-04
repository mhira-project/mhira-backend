import { QueryArgsType } from '@nestjs-query/query-graphql';
import { ArgsType } from '@nestjs/graphql';
import { MailTemplate } from '../models/mail-template.model';

@ArgsType()
export class MailTemplateQuery extends QueryArgsType(MailTemplate) {}

export const MailTemplateConnection = MailTemplateQuery.ConnectionType;