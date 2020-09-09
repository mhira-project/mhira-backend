import { PermissionRepository } from "../repositories/permission.repository";


export class PermissionService {

    constructor(
        private permissionRepository: PermissionRepository
    ) { }

    buildPermissions() {
        return;
    }
}
