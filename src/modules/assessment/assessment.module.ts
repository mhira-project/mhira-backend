import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/auth.guard';
import { CreateAssessmentInput } from './dtos/create-assessment.input';
import { UpdateAssessmentInput } from './dtos/update-assessment.input';
import { Assessment } from './models/assessment.model';
import { SortDirection } from '@nestjs-query/core';
import { UsePermission } from '../permission/decorators/permission.decorator';
import { PermissionEnum } from '../permission/enums/permission.enum';
import { PermissionGuard } from '../permission/guards/permission.guard';

const guards = [GqlAuthGuard, PermissionGuard];
@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [
                NestjsQueryTypeOrmModule.forFeature([
                    Assessment
                ]),
            ],
            // describe the resolvers you want to expose
            resolvers: [{
                DTOClass: Assessment,
                EntityClass: Assessment,
                CreateDTOClass: CreateAssessmentInput,
                UpdateDTOClass: UpdateAssessmentInput,
                guards,
                read: {
                    guards, defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
                    decorators: [UsePermission(PermissionEnum.VIEW_ASSESSMENTS)]
                },
                create: { decorators: [UsePermission(PermissionEnum.MANAGE_ASSESSMENTS)] },
                update: { decorators: [UsePermission(PermissionEnum.MANAGE_ASSESSMENTS)] },
                delete: { decorators: [UsePermission(PermissionEnum.MANAGE_ASSESSMENTS)] },

            }],
        }),
    ],
})
export class AssessmentModule { }
