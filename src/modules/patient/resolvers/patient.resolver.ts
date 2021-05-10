import { mergeFilter, SortDirection } from '@nestjs-query/core';
import {
    ConnectionType,
    DeleteOneInputType,
    QueryArgsType,
    UpdateOneInputType,
} from '@nestjs-query/query-graphql';
import { Logger, NotFoundException, UseGuards } from '@nestjs/common';
import { Args, ArgsType, ID, InputType, Mutation, ObjectType, PartialType, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/modules/auth/auth-user.decorator';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { UsePermission } from 'src/modules/permission/decorators/permission.decorator';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { User } from 'src/modules/user/models/user.model';
import { PatientAuthorizer } from '../authorizers/patient.authorizer';
import { UpdatePatientInput } from '../dto/update-patient.input';
import { Patient } from '../models/patient.model';
import { PatientQueryService } from '../providers/patient-query.service';


@ArgsType()
class PatientQuery extends QueryArgsType(Patient) { }

@ObjectType()
class PatientConnection extends ConnectionType<Patient>(Patient) { }

@InputType()
class UpdateOnePatientInput extends UpdateOneInputType(UpdatePatientInput) { }

@InputType()
class DeleteOnePatientInput extends DeleteOneInputType() { }

@ObjectType()
class PatientDeleteResponse extends PartialType(Patient) { }

@Resolver(() => Patient)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class PatientResolver {

    constructor(
        protected service: PatientQueryService,
    ) { }

    @Query(() => PatientConnection)
    @UsePermission(PermissionEnum.VIEW_PATIENTS)
    async patients(
        @Args({ type: () => PatientQuery }) query: PatientQuery,
        @CurrentUser() currentUser: User,
    ): Promise<PatientConnection> {

        const authorizeFilter = await PatientAuthorizer.authorizePatient(currentUser?.id);

        const combinedFilter = mergeFilter(query.filter, authorizeFilter);

        // Apply combined authorized filter
        query.filter = combinedFilter;

        // Apply default sort if not provided
        query.sorting = query.sorting?.length
            ? query.sorting
            : [{ field: 'id', direction: SortDirection.DESC }];

        return PatientConnection.createFromPromise(
            (q) => this.service.query(q),
            query,
            (q) => this.service.count(q),
        );
    }

    @Query(() => Patient)
    @UsePermission(PermissionEnum.VIEW_PATIENTS)
    async patient(
        @Args('id', { type: () => ID }) patientId: number,
        @CurrentUser() currentUser: User,
    ): Promise<Patient> {

        const authorizeFilter = await PatientAuthorizer.authorizePatient(currentUser?.id);

        const combinedFilter = mergeFilter({ id: { eq: patientId } }, authorizeFilter);

        const patients = await this.service.query({ paging: { limit: 1 }, filter: combinedFilter });

        const patient = patients?.[0];

        if (!patient) {
            throw new NotFoundException();
        }

        return patient;
    }


    @Mutation(() => Patient)
    @UsePermission(PermissionEnum.MANAGE_PATIENTS)
    async updateOnePatient(
        @Args('input') input: UpdateOnePatientInput,
        @CurrentUser() currentUser: User,
    ): Promise<Patient> {

        const authorizeFilter = await PatientAuthorizer.authorizePatient(currentUser?.id);

        const combinedFilter = mergeFilter({ id: { eq: Number(input.id) } }, authorizeFilter);

        const patients = await this.service.query({ paging: { limit: 1 }, filter: combinedFilter });

        const patient = patients?.[0];

        if (!patient) {
            throw new NotFoundException();
        }

        return this.service.updateOne(input.id, input.update);
    }

    @Mutation(() => PatientDeleteResponse)
    @UsePermission(PermissionEnum.DELETE_PATIENTS)
    async deleteOnePatient(
        @Args('input', { type: () => DeleteOnePatientInput }) input: DeleteOnePatientInput,
        @CurrentUser() currentUser: User,
    ): Promise<PatientDeleteResponse> {

        const authorizeFilter = await PatientAuthorizer.authorizePatient(currentUser?.id);

        const combinedFilter = mergeFilter({ id: { eq: Number(input.id) } }, authorizeFilter);

        const patients = await this.service.query({ paging: { limit: 1 }, filter: combinedFilter });

        const patient = patients?.[0];

        if (!patient) {
            throw new NotFoundException();
        }

        return this.service.deleteOne(input.id);
    }

}
