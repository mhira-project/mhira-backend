import { UseGuards } from '@nestjs/common';
import { Args, InputType, Mutation, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { QueryService, InjectQueryService } from '@nestjs-query/core';
import { CreateOneInputType, CreateManyInputType } from '@nestjs-query/query-graphql';
import { UseOrPermissions, UsePermission } from 'src/modules/permission/decorators/permission.decorator';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { DepartmentInput } from '../dtos/department.input';
import { Department } from '../models/department.model';


@InputType()
export class CreateOneDepartmentInput extends CreateOneInputType('department', DepartmentInput) { }

@InputType()
export class CreateManyDepartmentsInput extends CreateManyInputType('departments', DepartmentInput) { }

@Resolver(() => Department)
@UseGuards(GqlAuthGuard, PermissionGuard)
@UseOrPermissions([PermissionEnum.VIEW_PATIENTS, PermissionEnum.MANAGE_PATIENTS])
export class DepartmentResolver {

    constructor(
        @InjectQueryService(Department) readonly service: QueryService<Department>
    ) { }

    @Mutation(() => Department)
    @UsePermission(PermissionEnum.MANAGE_SETTINGS)
    async createOneDepartment(@Args('input', { type: () => CreateOneDepartmentInput }) input: CreateOneDepartmentInput): Promise<Department> {

        // delegate further actions to service
        return this.service.createOne(input['department']);
    }

    @Mutation(() => [Department])
    @UsePermission(PermissionEnum.MANAGE_PATIENTS)
    async createManyDepartments(@Args('input', { type: () => CreateManyDepartmentsInput }) input: CreateManyDepartmentsInput): Promise<Department[]> {

        // delegate further actions to service
        return this.service.createMany(input['departments']);
    }

}
