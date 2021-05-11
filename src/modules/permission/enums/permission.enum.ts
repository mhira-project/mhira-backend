

export const Permissions = {

    MANAGE_USERS: { value: 'manage users', group: 'User Management' },
    VIEW_USERS: { value: 'view users', group: 'User Management' },
    DELETE_USERS: { value: 'delete users', group: 'User Management' },

    MANAGE_PATIENTS: { value: 'manage patients', group: 'Patient Management' },
    VIEW_PATIENTS: { value: 'view patients', group: 'Patient Management' },
    DELETE_PATIENTS: { value: 'delete patients', group: 'Patient Management' },

    VIEW_SYSCONFIG: { value: 'view sysconf', group: 'System Configuration' },
    MANAGE_SYSCONFIG: { value: 'manage sysconf', group: 'System Configuration' },

    VIEW_SETTINGS: { value: 'view settings', group: 'System Configuration' },// this could be redundant, as all users need to access settings
    MANAGE_SETTINGS: { value: 'manage settings', group: 'System Configuration' },

    VIEW_QUESTIONNAIRES: { value: 'view questionnaires', group: 'Questionnaires' },
    MANAGE_QUESTIONNAIRES: { value: 'manage questionnaires', group: 'Questionnaires' },
    DELETE_QUESTIONNAIRES: { value: 'delete questionnaires', group: 'Questionnaires' },

    VIEW_ASSESSMENTS: { value: 'view assessments', group: 'Assessments' },
    MANAGE_ASSESSMENTS: { value: 'manage assessments', group: 'Assessments' },
    DELETE_ASSESSMENTS: { value: 'delete assessments', group: 'Assessments' },

    VIEW_REPORTING_TOOLS: { value: 'view reporting_tools', group: 'Reporting Tools' },
    MANAGE_REPORTING_TOOLS: { value: 'manage reporting_tools', group: 'Reporting Tools' },

    VIEW_ROLES_PERMISSIONS: { value: 'view roles_permissions', group: 'Roles and Permissions' },
    MANAGE_ROLES_PERMISSIONS: { value: 'manage roles_permissions', group: 'Roles and Permissions' },

}

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
