import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Logs } from './logs.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { classToPlain } from 'class-transformer';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(Logs) // Inject the Repository for your LogEntity
        private readonly logRepository: Repository<Logs>,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const startTime = Date.now();
        const request = context.switchToHttp().getNext().req;
        const requestBody = GqlExecutionContext.create(context).getArgByIndex(
            3,
        );
        const operationType = requestBody.parentType.toString();
        const returnType = requestBody.returnType.toString();

        const logEntity: any = {
            operation: requestBody.fieldName,
            operationType,
            returnType,
            userAgent: request.headers['user-agent'],
            ipAddress: request.ip,
            user: request.user
        };

        return next.handle().pipe(
            tap(data => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;

                if (operationType == 'Query') {
                    logEntity.queryResult = (!!data.edges
                        ? data.edges.map(edge => edge.node.id || edge.node._id)
                        : data.map(rec => rec.id) || []
                    ).toString();
                } else {
                    if (requestBody.fieldName == 'login') {
                        logEntity.mutationVariables = requestBody.variableValues.identifier
                    } else {
                        logEntity.mutationVariables =
                            requestBody?.variableValues?.id ||
                            requestBody?.variableValues?._id;
                    }
                }

                logEntity.responseTime = responseTime;

                this.logRepository.save(classToPlain(logEntity));
            }),
            catchError((error: Error) => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;

                if (requestBody.fieldName == 'login') {
                    logEntity.mutationVariables = requestBody.variableValues.identifier
                }

                logEntity.responseTime = responseTime;
                logEntity.errorMessage = error.message;
                this.logRepository.save(classToPlain(logEntity));

                return throwError(error);
            }),
        );
    }
}
