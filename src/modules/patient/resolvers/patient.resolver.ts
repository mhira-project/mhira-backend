import { mergeFilter } from '@nestjs-query/core';
import { ConnectionType, QueryArgsType } from '@nestjs-query/query-graphql';
import { UseGuards } from '@nestjs/common';
import { Args, ArgsType, ID, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/modules/auth/auth-user.decorator';
import { GqlAuthGuard } from 'src/modules/auth/auth.guard';
import { UsePermission } from 'src/modules/permission/decorators/permission.decorator';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { PermissionGuard } from 'src/modules/permission/guards/permission.guard';
import { User } from 'src/modules/user/models/user.model';
import { PatientAuthorizer } from '../authorizers/patient.authorizer';
import { Patient } from '../models/patient.model';
import { PatientQueryService } from '../providers/patient-query.service';


@ArgsType()
class PatientQuery extends QueryArgsType(Patient) { }

@ObjectType()
class PatientConnection extends ConnectionType<Patient>(Patient) { }

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

        query.filter = combinedFilter;

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


        return patients?.[0];
    }
}
