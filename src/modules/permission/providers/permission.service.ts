import { Logger, OnModuleInit } from '@nestjs/common';
import { User } from 'src/modules/user/models/user.model';
import { Any } from 'typeorm';
import { PermissionEnum } from '../enums/permission.enum';
import { RoleCode } from '../enums/role-code.enum';
import { Permission } from '../models/permission.model';
import { Role } from '../models/role.model';

export class PermissionService implements OnModuleInit {
    private readonly logger = new Logger(PermissionService.name);

    async onModuleInit() {
        // Keep database permissions up-to-date
        await this.populatePermissionsInDB();
    }

    private async populatePermissionsInDB() {
        const dbPermissions = (await Permission.find()).map(
            permission => permission.name,
        );

        const systemPermissions: string[] = Object.keys(PermissionEnum).map(
            key => PermissionEnum[key],
        );

        const permissionsToDelete = dbPermissions.filter(
            e => !systemPermissions.includes(e),
        );
        const permissionsToCreate = systemPermissions.filter(
            e => !dbPermissions.includes(e),
        );

        if (permissionsToDelete.length > 0) {
            this.logger.log(
                'Prunning un-needed permissions: ' +
                    permissionsToDelete.join(','),
            );

            await Permission.createQueryBuilder()
                .delete()
                .where({ name: Any(permissionsToDelete) })
                .execute();
        }

        if (permissionsToCreate.length > 0) {
            this.logger.log(
                'Adding missing permissions: ' + permissionsToCreate.join(','),
            );

            await Permission.createQueryBuilder()
                .insert()
                .into(Permission)
                .values(
                    permissionsToCreate.map(p => {
                        return { name: p };
                    }),
                )
                .execute();
        }

        // Auto Create Super-admin role if not exists
        let superAdminRole = await Role.findOne({ code: RoleCode.SUPER_ADMIN });
        if (!superAdminRole) {
            this.logger.log(
                'Role Super Admin not found in DB. System seeding it',
            );

            superAdminRole = new Role();
            superAdminRole.name = 'Super Admin';
            superAdminRole.code = RoleCode.SUPER_ADMIN;
            await superAdminRole.save();
        }

        // Auto Create No-Role role if not exists
        let noRole = await Role.findOne({ code: RoleCode.NO_ROLE });
        if (!noRole) {
            this.logger.log('Role No-Role not found in DB. System seeding it');

            noRole = new Role();
            noRole.name = 'No Role';
            noRole.code = RoleCode.NO_ROLE;
            await noRole.save();
        }

        // Assign all permissions to Super Admin
        const allPermissions = await Permission.find();
        superAdminRole.permissions = allPermissions;
        await superAdminRole.save();

        // Refetch super admin role from DB with its users
        superAdminRole = await Role.findOne({
            where: { code: RoleCode.SUPER_ADMIN },
            relations: ['users'],
        });

        // Seed generic super admin user if non exists
        if (superAdminRole.users.length === 0) {
            this.logger.log(
                'No Super Admin found in DB. System seeding a generic super admin: user: admin, first time password: admin',
            );

            const superAdminUser = new User();
            superAdminUser.firstName = 'Super';
            superAdminUser.lastName = 'Admin';
            superAdminUser.username = 'superadmin';
            superAdminUser.password = 'superadmin';
            superAdminUser.isSuperUser = true;
            superAdminUser.roles = [superAdminRole];

            await superAdminUser.save();
        }
    }

    static async userPermissionGrants(userId: number): Promise<Permission[]> {
        // re-select the user
        const user = await User.findOne({
            relations: ['permissions', 'roles'],
            where: { id: userId },
        });

        const directPermissions = user.permissions;

        const roleIds = user.roles.map(role => role.id);

        const roles = await Role.find({
            relations: ['permissions'],
            where: { id: Any(roleIds) },
        });

        const rolePermissions = [] as Permission[];
        roles.forEach(role => {
            rolePermissions.push(...role.permissions);
        });

        const permissions = [
            ...new Set([...directPermissions, ...rolePermissions]),
        ];

        return permissions;
    }
}
