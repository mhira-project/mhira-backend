import { UseGuards } from '@nestjs/common';
import { Args, InputType, Mutation, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { EmergencyContact } from '../models/emergency-contact.model';
import { QueryService, InjectQueryService } from '@nestjs-query/core';
import { CreateOneInputType, CreateManyInputType } from '@nestjs-query/query-graphql';
import { UseOrPermissions, UsePermission } from 'src/modules/permission/decorators/permission.decorator';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { EmergencyContactInput } from '../dto/emergency-contact.input';


@InputType()
export class CreateOneEmergencyContactInput extends CreateOneInputType('emergencyContact', EmergencyContactInput) { }

@InputType()
export class CreateManyEmergencyContactsInput extends CreateManyInputType('emergencyContacts', EmergencyContactInput) { }

@Resolver(() => EmergencyContact)
@UseGuards(GqlAuthGuard, PermissionGuard)
@UseOrPermissions([PermissionEnum.VIEW_PATIENTS, PermissionEnum.VIEW_PATIENTS])
export class EmergencyContactResolver {

    constructor(
        @InjectQueryService(EmergencyContact) readonly service: QueryService<EmergencyContact>
    ) { }

    @Mutation(() => EmergencyContact)
    @UsePermission(PermissionEnum.MANAGE_PATIENTS)
    async createOneEmergencyContact(@Args('input', { type: () => CreateOneEmergencyContactInput }) input: CreateOneEmergencyContactInput): Promise<EmergencyContact> {

        // delegate further actions to service
        return this.service.createOne(input['emergencyContact']);
    }

    @Mutation(() => [EmergencyContact])
    @UsePermission(PermissionEnum.MANAGE_PATIENTS)
    async createManyEmergencyContacts(@Args('input', { type: () => CreateManyEmergencyContactsInput }) input: CreateManyEmergencyContactsInput): Promise<EmergencyContact[]> {

        // delegate further actions to service
        return this.service.createMany(input['emergencyContacts']);
    }

}
