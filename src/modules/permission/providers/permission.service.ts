import { User } from "src/modules/user/models/user.model";
import { Any } from "typeorm";
import { Permission } from "../models/permission.model";
import { Role } from "../models/role.model";


export class PermissionService {

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
