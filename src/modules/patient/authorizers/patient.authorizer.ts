import { Authorizer } from "@nestjs-query/query-graphql";
import { UserContext } from "src/modules/auth/interfaces/auth-interfaces";
import { Filter } from '@nestjs-query/core';
import { Patient } from "../models/patient.model";
import { User } from "src/modules/user/models/user.model";

export class PatientAuthorizer implements Authorizer<Patient> {


    async authorize(context: UserContext): Promise<Filter<Patient>> {

        // delegates to `authorizePatient` method
        return Promise.resolve({}); //this.authorizePatient(context); // temporary fix to create-patient-api
    }

    async authorizeRelation(relationName: string, context: UserContext): Promise<Filter<Patient>> {

        // delegates to `authorizePatient` method
        return Promise.resolve({}); //this.authorizePatient(context); // temporary fix to create-patient-api
    }

    protected async authorizePatient(context: UserContext): Promise<Filter<Patient>> {

        // Reload current user with departments
        const currentUser = await User.findOne({
            where: { id: context.req.user.id },
            relations: ['departments']
        });

        const deparmentIds = currentUser.departments.map((department) => department.id);

        // User has no departments
        if (deparmentIds.length < 1) {

            return Promise.resolve(
                { departments: { id: { is: null } } } // include patients without a department
            );
        }

        return Promise.resolve({
            or: [
                { departments: { id: { in: deparmentIds } } },
                { departments: { id: { is: null } } }
            ]
        });
    }

}
