import { Filter } from '@nestjs-query/core';
import { Patient } from "../models/patient.model";
import { User } from "src/modules/user/models/user.model";
import { PermissionService } from 'src/modules/permission/providers/permission.service';
import { PermissionEnum } from 'src/modules/permission/enums/permission.enum';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { Connection, In } from 'typeorm';

export class PatientAuthorizer {
    /**
     * Returns a filter of the Patients Query,
     * By the current user id's departments.
     * 
     * @param userId 
     * @returns 
     */
    static async authorizePatient(userId: number, connection: Connection): Promise<Filter<Patient>> {
        if (!connection) {
            throw new UnauthorizedException(`Connection not found!`);
        }

        // Reload current user with departments
        const currentUser = await connection.getRepository(User).findOne({
            where: { id: userId },
            relations: ['departments'],
        });

        if (await PermissionService.userCan(currentUser.id, PermissionEnum.VIEW_ALL_PATIENTS, connection)) {
            return {};
        }

        const deparmentIds = currentUser.departments.map((department) => department.id);

        // User has no departments
        if (deparmentIds.length < 1) {

            throw new UnauthorizedException(`You need to be assigned atleast one department to view patients.`)
        }

        return Promise.resolve({
            or: [
                { departments: { id: { in: deparmentIds } } },
            ]
        });
    }

}
