import { OnModuleInit } from "@nestjs/common";
import { User } from "src/modules/user/models/user.model";
import { Any } from "typeorm";
import { GuardType } from "../enums/guard-type.enum";
import { PermissionEnum } from "../enums/permission.enum";
import { Permission } from "../models/permission.model";
import { Role } from "../models/role.model";

export class PermissionService implements OnModuleInit {

    async onModuleInit() {

        // Keep database permissions up-to-date
        await this.populatePermissionsInDB();
    }

    private async populatePermissionsInDB() {
        const dbPermissions = (await Permission.find()).map(permission => permission.name);

        const systemPermissions: string[] = Object.keys(PermissionEnum).map(key => PermissionEnum[key]);

        const permissionsToDelete = dbPermissions.filter(e => !systemPermissions.includes(e));
        const permissionsToCreate = systemPermissions.filter(e => !dbPermissions.includes(e));

        if (permissionsToDelete.length > 0) {
            await Permission.createQueryBuilder()
                .delete()
                .where({ name: Any(permissionsToDelete) })
                .execute();
        }


        if (permissionsToCreate.length > 0) {
            await Permission.createQueryBuilder()
                .insert()
                .into(Permission)
                .values(permissionsToCreate.map(p => { return { name: p, guard: GuardType.ADMIN } }))
                .execute();
        }

    }

    static async userPermissionGrants(userId: number): Promise<Permission[]> {

        // re-select the user
        const user = await User.findOne({
            relations: ['permissions', 'roles'],
            where: { id: userId },
        });

        const directPermissions = user.permissions;

        const roleIds = user.roles.map((role) => role.id);

        const roles = await Role.find({
            relations: ['permissions'],
            where: { id: Any(roleIds) },
        });

        const rolePermissions = [] as Permission[];
        roles.forEach(role => {
            rolePermissions.push(...role.permissions)
        });

        const permissions = [...new Set([...directPermissions, ...rolePermissions])]

        return permissions;
    }
}
