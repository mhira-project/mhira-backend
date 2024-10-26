import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { User } from 'src/modules/user/models/user.model';
import { Hash } from 'src/shared';
import { Any, Connection, Repository } from 'typeorm';
import { MAX_ROLE_HIERARCHY, MIN_ROLE_HIERARCHY } from '../constants';
import { PermissionEnum, systemPermissions as PermissionsMaster } from '../enums/permission.enum';
import { RoleCode } from '../enums/role-code.enum';
import { Permission } from '../models/permission.model';
import { Role } from '../models/role.model';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbols';
@Injectable()
export class PermissionService implements OnModuleInit {
    private readonly logger = new Logger(PermissionService.name);
    private permissionRepository: Repository<Permission>;
    private roleRepository: Repository<Role>;
    private userRepository: Repository<User>;

    constructor(@Inject(CONNECTION) private connection: Connection) {
        this.permissionRepository = this.connection.getRepository(Permission);
        this.roleRepository = this.connection.getRepository(Role);
        this.userRepository = this.connection.getRepository(User);
    }

    async onModuleInit() {
        // Keep database permissions up-to-date
        await this.populatePermissionsInDB();
    }

    public async populatePermissionsInDB() {
        const dbPermissions = (await this.permissionRepository.find()).map(
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

            await this.permissionRepository.createQueryBuilder()
                .delete()
                .where({ name: Any(permissionsToDelete) })
                .execute();
        }

        if (permissionsToCreate.length > 0) {
            this.logger.log(
                'Adding missing permissions: ' + permissionsToCreate.join(','),
            );

            // @TODO tenancy check if correct 
            await this.permissionRepository.createQueryBuilder()
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
        let superAdminRole = await this.roleRepository.findOne({ code: RoleCode.SUPER_ADMIN });
        if (!superAdminRole) {
            this.logger.log(
                'Role Super Admin not found in DB. System seeding it',
            );

            superAdminRole = new Role();
            superAdminRole.name = 'Super Admin';
            superAdminRole.code = RoleCode.SUPER_ADMIN;
            superAdminRole.hierarchy = MIN_ROLE_HIERARCHY;
            await this.roleRepository.save(superAdminRole);
        }

        // Auto Create No-Role role if not exists
        let noRole = await this.roleRepository.findOne({ code: RoleCode.NO_ROLE });
        if (!noRole) {
            this.logger.log('Role No-Role not found in DB. System seeding it');

            noRole = new Role();
            noRole.name = 'Default';
            noRole.code = RoleCode.NO_ROLE;
            noRole.hierarchy = MAX_ROLE_HIERARCHY;
            await this.roleRepository.save(noRole);
        }

        // Assign all permissions to Super Admin
        const allPermissions = await this.permissionRepository.find();
        superAdminRole.permissions = allPermissions;
        await this.roleRepository.save(superAdminRole);

        // Refetch super admin role from DB with its users
        superAdminRole = await this.roleRepository.findOne({
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

            await this.userRepository.save(superAdminUser);
        }
    }

    static async userPermissionGrants(userId: number, connection: Connection): Promise<Permission[]> {
        // re-select the user
        // @TODO tenancy update to use connection
        const user = await connection.getRepository(User).findOne({
            relations: ['permissions', 'roles'],
            where: { id: userId },
        });

        const directPermissions = user.permissions;

        const roleIds = user.roles.map(role => role.id);

        const roles = await connection.getRepository(Role).find({
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

    static async userCan(userId: number, action: string, connection: Connection) {

        const userPermissions = await PermissionService.userPermissionGrants(userId, connection);

        return !!userPermissions.find(permission => permission.name === action)
    }

    /**
     * Compares hierarchy of one user and another target
     * @param currentUser user to compare to target
     * @param targetUser target to compare with
     * @returns true when currentUser has stronger hierarchy than targetUser
     */
    static async compareHierarchy(currentUser: User | number, targetUser: User | number, connection: Connection): Promise<boolean> {
        const userRepository = connection.getRepository(User)
        if (typeof currentUser === 'number') {
            // @TODO tenancy update to use connection
            currentUser = await userRepository.findOneOrFail({
                where: { id: currentUser },
                relations: ['roles'],
            });
        }

        if (typeof targetUser === 'number') {
            targetUser = await userRepository.findOneOrFail({
                where: { id: targetUser },
                relations: ['roles'],
            });
        }

        // true if currentUser is stronger than targetUser
        return Math.min(...currentUser.roles.map(r => r.hierarchy)) < Math.min(...targetUser.roles.map(r => r.hierarchy));
    }
}
