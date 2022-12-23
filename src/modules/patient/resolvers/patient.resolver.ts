import {mergeFilter, SortDirection} from '@nestjs-query/core';
import {
    ConnectionType,
    CreateOneInputType,
    DeleteOneInputType,
    QueryArgsType,
    UpdateOneInputType,
} from '@nestjs-query/query-graphql';
import {BadRequestException, Inject, UseGuards} from '@nestjs/common';
import {
    Args,
    ArgsType,
    ID,
    InputType, Int,
    Mutation,
    ObjectType,
    PartialType,
    Query,
    Resolver,
} from '@nestjs/graphql';
import {CurrentUser} from 'src/modules/auth/auth-user.decorator';
import {GqlAuthGuard} from 'src/modules/auth/auth.guard';
import {UsePermission} from 'src/modules/permission/decorators/permission.decorator';
import {PermissionEnum} from 'src/modules/permission/enums/permission.enum';
import {PermissionGuard} from 'src/modules/permission/guards/permission.guard';
import {PermissionService} from 'src/modules/permission/providers/permission.service';
import {User} from 'src/modules/user/models/user.model';
import {PatientAuthorizer} from '../authorizers/patient.authorizer';
import {CreatePatientInput} from '../dto/create-patient.input';
import {UpdatePatientInput} from '../dto/update-patient.input';
import {PatientQueryService} from '../providers/patient-query.service';
import {Patient, PatientReport} from '../models/patient.model';
import {PatientStatus} from '../models/patient-status.model';
import {CreateOnePatientStatusInput} from '../dto/update-patient-status.input';
import {PatientStatusService} from '../providers/patient-status.service';
import {SoftDeleteQueryBuilder} from "typeorm/query-builder/SoftDeleteQueryBuilder";
import {UpdateResult} from "typeorm";

@ArgsType()
class PatientQuery extends QueryArgsType(Patient) {
}

const PatientConnection = PatientQuery.ConnectionType;

@InputType()
export class CreateOnePatientInput extends CreateOneInputType(
    'patient',
    CreatePatientInput,
) {
}

@InputType()
class UpdateOnePatientInput extends UpdateOneInputType(
    Patient,
    UpdatePatientInput,
) {
}

@InputType()
class DeleteOnePatientInput extends DeleteOneInputType(Patient) {
}

@ObjectType()
class PatientDeleteResponse extends PartialType(Patient) {
}

@Resolver(() => Patient)
@UseGuards(GqlAuthGuard, PermissionGuard)
export class PatientResolver {
    @Inject() patientStatusService: PatientStatusService;

    constructor(protected service: PatientQueryService) {
    }

    @Query(() => PatientConnection)
    @UsePermission(PermissionEnum.VIEW_PATIENTS)
    async patients(
        @Args({type: () => PatientQuery}) query: PatientQuery,
        @CurrentUser() currentUser: User,
    ): Promise<ConnectionType<Patient>> {
        const authorizeFilter = await PatientAuthorizer.authorizePatient(
            currentUser?.id,
        );

        const combinedFilter = mergeFilter(query.filter, authorizeFilter);

        // Apply combined authorized filter
        query.filter = combinedFilter;

        // Apply default sort if not provided
        query.sorting = query.sorting?.length
            ? query.sorting
            : [{field: 'id', direction: SortDirection.DESC}];

        return PatientConnection.createFromPromise(
            q => this.service.query(q),
            query,
            q => this.service.count(q),
        );
    }

    @Query(() => Patient)
    @UsePermission(PermissionEnum.VIEW_PATIENTS)
    async patient(
        @Args('id', {type: () => ID}) patientId: number,
        @CurrentUser() currentUser: User,
    ): Promise<Patient> {
        // Get patient if authorized. Throws exception if Not Found
        return this.service.getOnePatient(currentUser, patientId);
    }

    @Mutation(() => Patient)
    @UsePermission(PermissionEnum.MANAGE_PATIENTS)
    async createOnePatient(
        @Args('input', {type: () => CreateOnePatientInput})
            input: CreateOnePatientInput,
        @CurrentUser() currentUser: User,
    ): Promise<Patient> {
        const patientInput = input['patient'] as CreatePatientInput;

        // Reload current user with departments
        currentUser = await User.findOne({
            where: {id: currentUser.id},
            relations: ['departments'],
        });

        // Check input deparments overlap with departments user is a member
        // Or User has permission over patients in all departments.

        const canViewAllPatients = await PermissionService.userCan(
            currentUser.id,
            PermissionEnum.VIEW_ALL_PATIENTS,
        );

        if (!canViewAllPatients) {
            const deparmentIds = currentUser.departments.map(
                department => department.id,
            );
            const exceptionDepartments = patientInput.departmentIds.filter(
                inputId => deparmentIds.indexOf(inputId) < 0,
            );

            if (exceptionDepartments?.length) {
                throw new BadRequestException(
                    `User cannot create Patients in deparments of which is not a member`,
                );
            }
        }

        // Check for duplicate medical record no
        if (patientInput.medicalRecordNo === '')
            patientInput.medicalRecordNo = null; // coalesce '' to NULL, as field is nullable

        if (patientInput.medicalRecordNo) {
            const exists = await Patient.findOne({
                medicalRecordNo: patientInput.medicalRecordNo,
            });
            if (exists) {
                throw new BadRequestException(
                    'Patient with same Medical Record No. already exists',
                );
            }
        }

        return this.service.createOne(patientInput);
    }

    @Mutation(() => Patient)
    @UsePermission(PermissionEnum.MANAGE_PATIENTS)
    async updateOnePatient(
        @Args('input') input: UpdateOnePatientInput,
        @CurrentUser() currentUser: User,
    ): Promise<Patient> {
        const {id, update} = input;

        // Get patient if authorized. Throws exception if Not Found
        await this.service.getOnePatient(currentUser, Number(input.id));

        // Check for duplicate medical record no
        if (update.medicalRecordNo === '') update.medicalRecordNo = null; // coalesce '' to NULL, as field is nullable

        if (!!update.medicalRecordNo) {
            const exists = await Patient.createQueryBuilder('patient')
                .where(
                    'patient.medicalRecordNo = :medicalRecordNo AND patient.id <> :id',
                    {medicalRecordNo: update.medicalRecordNo, id},
                )
                .getOne();

            if (exists) {
                throw new BadRequestException(
                    'Patient with same Medical Record No. already exists',
                );
            }
        }

        return this.service.updateOne(input.id, input.update);
    }

    @Mutation(() => PatientDeleteResponse)
    @UsePermission(PermissionEnum.DELETE_PATIENTS)
    async deleteOnePatient(
        @Args('input', {type: () => DeleteOnePatientInput})
            input: DeleteOnePatientInput,
        @CurrentUser() currentUser: User,
    ): Promise<PatientDeleteResponse> {
        // Get patient if authorized. Throws exception if Not Found
        await this.service.getOnePatient(currentUser, Number(input.id));

        return this.service.deleteOne(input.id);
    }

    @Mutation(() => Patient)
    @UsePermission(PermissionEnum.MANAGE_PATIENTS)
    async archiveOnePatient(
        @Args('input', {type: () => ID}) id: number,
    ): Promise<UpdateResult> {
        const result = await this.service.archiveOnePatient(id);
        return result;
    }

    @Query(() => PatientReport)
    @UsePermission(PermissionEnum.VIEW_PATIENTS)
    async generatePatientReport(
        @Args('id', { type: () => ID }) id: number,
        @Args('questionnaireId', { nullable: true }) questionnaireId: string,
        @Args('assessmentStatus', { nullable: true }) assessmentStatus: string,
        @CurrentUser() currentUser: User,
    ): Promise<PatientReport> {
        try {
            await this.service.getOnePatient(currentUser, id);

            return await this.service.getQuestionnaireReport(
                id,
                assessmentStatus,
                questionnaireId,
            );
        } catch (error) {
            return error;
        }
    }

    @Mutation(() => PatientStatus)
    @UsePermission(PermissionEnum.MANAGE_SETTINGS)
    async createOnePatientStatus(
        @Args('input', {type: () => CreateOnePatientStatusInput})
            input: CreateOnePatientStatusInput,
    ): Promise<PatientStatus> {
        return await this.patientStatusService.create(input);
    }
}
