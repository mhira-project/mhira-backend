import { Logger, OnModuleInit } from '@nestjs/common';
import { User } from 'src/modules/user/models/user.model';
import { Hash } from 'src/shared';
import { Any } from 'typeorm';
import { MAX_ROLE_HIERARCHY, MIN_ROLE_HIERARCHY } from '../constants';
import { PermissionEnum, systemPermissions as PermissionsMaster } from '../enums/permission.enum';
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
                    PermissionsMaster
                        .filter(permission => permissionsToCreate.includes(permission.name))
                        .map(permission => {
                            return { name: permission.name, group: permission.group };
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
            superAdminRole.hierarchy = MIN_ROLE_HIERARCHY;
            await superAdminRole.save();
        }

        // Auto Create No-Role role if not exists
        let noRole = await Role.findOne({ code: RoleCode.NO_ROLE });
        if (!noRole) {
            this.logger.log('Role No-Role not found in DB. System seeding it');

            noRole = new Role();
            noRole.name = 'Default';
            noRole.code = RoleCode.NO_ROLE;
            noRole.hierarchy = MAX_ROLE_HIERARCHY;
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

            const configSuperAdminPassword = !!process.env.SUPERADMIN_PASSWORD ? String(process.env.SUPERADMIN_PASSWORD) : null;
            const configSuperAdminUsername = !!process.env.SUPERADMIN_USERNAME ? String(process.env.SUPERADMIN_USERNAME) : null;

            const password = configSuperAdminPassword?.length ? configSuperAdminPassword : 'superadmin';
            const username = configSuperAdminUsername?.length ? configSuperAdminUsername : 'superadmin';

            const superAdminUser = new User();
            superAdminUser.firstName = 'Super';
            superAdminUser.lastName = 'Admin';
            superAdminUser.username = username;
            superAdminUser.password = await Hash.make(password);
            superAdminUser.isSuperUser = true;
            superAdminUser.roles = [superAdminRole];

            this.logger.verbose(`User ${username} created with default password=${password}`);

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

        return [
            ...new Set([...directPermissions, ...rolePermissions]),
        ];
    }

    static async userCan(userId: number, action: string) {

        const userPermissions = await PermissionService.userPermissionGrants(userId);

        return !!userPermissions.find(permission => permission.name === action)
    }

    /**
     * Compares hierarchy of one user and another target
     * @param currentUser user to compare to target
     * @param targetUser target to compare with
     * @returns true when currentUser has stronger hierarchy than targetUser
     */
    static async compareHierarchy(currentUser: User | number, targetUser: User | number): Promise<boolean> {
        if (typeof currentUser === 'number') {
            currentUser = await User.findOneOrFail({
                where: { id: currentUser },
                relations: ['roles'],
            });
        }

        if (typeof targetUser === 'number') {
            targetUser = await User.findOneOrFail({
                where: { id: targetUser },
                relations: ['roles'],
            });
        }

        // true if currentUser is stronger than targetUser
        return Math.min(...currentUser.roles.map(r => r.hierarchy)) < Math.min(...targetUser.roles.map(r => r.hierarchy));
    }
}
