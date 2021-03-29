


export enum PermissionEnum {

    MANAGE_USERS = 'manage users',
    VIEW_USERS = 'view users',
    DELETE_USERS = 'delete users',

    MANAGE_PATIENTS = 'manage patients',
    VIEW_PATIENTS = 'view patients',
    DELETE_PATIENTS = 'delete patients',

    VIEW_SYSCONFIG = 'view sysconf',
    MANAGE_SYSCONFIG = 'manage sysconf',

    VIEW_SETTINGS = 'view settings', // this could be redundant, as all users need to access settings
    MANAGE_SETTINGS = 'manage settings',

    VIEW_QUESTIONNAIRES = 'view questionnaires',
    MANAGE_QUESTIONNAIRES = 'manage questionnaires',
    DELETE_QUESTIONNAIRES = 'delete questionnaires',

    VIEW_ASSESSMENTS = 'view assessments',
    MANAGE_ASSESSMENTS = 'manage assessments',
    DELETE_ASSESSMENTS = 'delete assessments',

    VIEW_REPORTING_TOOLS = 'view reporting_tools',
    MANAGE_REPORTING_TOOLS = 'manage reporting_tools',

    VIEW_ROLES_PERMISSIONS = 'view roles_permissions',
    MANAGE_ROLES_PERMISSIONS = 'manage roles_permissions',

}
