
import { EventType } from '@nestjs-query/query-graphql/dist/src/subscription';
import { Injectable, Logger } from '@nestjs/common';
import { LogContext } from '../dtos/log-context.dto';
import { AuditLog } from '../models/audit-log.model';


@Injectable()
export class AuditService {

    private readonly logger = new Logger(AuditService.name);

    async log(context: LogContext) {

        this.logger.verbose(context);

        const record = AuditLog.create(context);

        await record.save();
    }


}
