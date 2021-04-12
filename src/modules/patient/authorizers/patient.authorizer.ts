import { Authorizer } from "@nestjs-query/query-graphql";
import { UserContext } from "src/modules/auth/interfaces/auth-interfaces";
import { Filter } from '@nestjs-query/core';
import { Patient } from "../models/patient.model";
import { User } from "src/modules/user/models/user.model";
import { Logger } from "@nestjs/common";
import { ForbiddenError } from "apollo-server-errors";


export class PatientAuthorizer implements Authorizer<Patient> {

    protected readonly logger = new Logger(PatientAuthorizer.name);

    async authorize(context: UserContext): Promise<Filter<Patient>> {

        // Reload current user with departments
        const currentUser = await User.findOne({
            where: { id: context.req.user.id },
            relations: ['departments']
        });

        const deparmentIds = currentUser.departments.map((department) => department.id);

        // User has no departments
        if (deparmentIds.length < 1) {

            Promise.resolve(
                { departments: { id: { is: null } } } // include patients without a department
            );
        }

        return Promise.resolve({
            or: [
                { departments: { id: { in: deparmentIds } } }, // include patients from own departments
                { departments: { id: { is: null } } } // include patients without a department
            ]
        });
    }

    async authorizeRelation(relationName: string, context: UserContext): Promise<Filter<unknown>> {
        // Reload current user with departments
        const currentUser = await User.findOne({
            where: { id: context.req.user.id },
            relations: ['departments']
        });

        const deparmentIds = currentUser.departments.map((department) => department.id);

        // User has no departments
        if (deparmentIds.length < 1) {

            Promise.resolve(
                { departments: { id: { is: null } } } // include patients without a department
            );
        }

        return Promise.resolve({
            or: [
                { departments: { id: { in: deparmentIds } } }, // include patients from own departments
                { departments: { id: { is: null } } } // include patients without a department
            ]
        });
    }

}
