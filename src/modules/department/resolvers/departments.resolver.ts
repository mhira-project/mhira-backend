import { Inject, UseGuards } from '@nestjs/common';
import { Args, InputType, Mutation } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { CreateOneInputType, CreateManyInputType } from '@nestjs-query/query-graphql';
import { UseOrPermissions, UsePermission } from 'src/modules/permission/decorators/permission.decorator';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { DepartmentInput } from '../dtos/department.input';
import { Department } from '../models/department.model';
import { DepartmentCrudService } from '../providers/deparment-crud.service';


@InputType()
export class CreateOneDepartmentInput extends CreateOneInputType('department', DepartmentInput) { }

@InputType()
export class CreateManyDepartmentsInput extends CreateManyInputType('departments', DepartmentInput) { }

@UseGuards(GqlAuthGuard, PermissionGuard)
@UseOrPermissions([PermissionEnum.VIEW_PATIENTS, PermissionEnum.MANAGE_PATIENTS])
export class DepartmentResolver {

    constructor(
        @Inject(DepartmentCrudService) private readonly queryService: DepartmentCrudService,
    ) {
    }

    @Mutation(() => Department)
    @UsePermission(PermissionEnum.MANAGE_SETTINGS)
    async createOneDepartment(@Args('input', { type: () => CreateOneDepartmentInput }) input: CreateOneDepartmentInput): Promise<Department> {
        // delegate further actions to service
        return this.queryService.createOne(input['department']);
    }

    @Mutation(() => [Department])
    @UsePermission(PermissionEnum.MANAGE_PATIENTS)
    async createManyDepartments(@Args('input', { type: () => CreateManyDepartmentsInput }) input: CreateManyDepartmentsInput): Promise<Department[]> {

        // delegate further actions to service
        return this.queryService.createMany(input['departments']);
    }

}
