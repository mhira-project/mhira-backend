export const systemPermissions = [
    { key: 'MANAGE_USERS', name: 'manage users', group: 'User Management' },
    { key: 'VIEW_USERS', name: 'view users', group: 'User Management' },
    { key: 'DELETE_USERS', name: 'delete users', group: 'User Management' },

    {
        key: 'MANAGE_PATIENTS',
        name: 'manage patients',
        group: 'Patient Management',
    },
    {
        key: 'VIEW_PATIENTS',
        name: 'view patients',
        group: 'Patient Management',
    },
    {
        key: 'VIEW_ALL_PATIENTS',
        name: 'view all patients',
        group: 'Patient Management',
    },
    {
        key: 'DELETE_PATIENTS',
        name: 'delete patients',
        group: 'Patient Management',
    },

    {
        key: 'VIEW_SYSCONFIG',
        name: 'view sysconf',
        group: 'System Configuration',
    },
    {
        key: 'MANAGE_SYSCONFIG',
        name: 'manage sysconf',
        group: 'System Configuration',
    },

    {
        key: 'VIEW_SETTINGS',
        name: 'view settings',
        group: 'System Configuration',
    }, // this could be redundant, as all users need to access settings
    {
        key: 'MANAGE_SETTINGS',
        name: 'manage settings',
        group: 'System Configuration',
    },

    {
        key: 'VIEW_QUESTIONNAIRES',
        name: 'view questionnaires',
        group: 'Questionnaires',
    },
    {
        key: 'MANAGE_QUESTIONNAIRES',
        name: 'manage questionnaires',
        group: 'Questionnaires',
    },
    {
        key: 'DELETE_QUESTIONNAIRES',
        name: 'delete questionnaires',
        group: 'Questionnaires',
    },

    { key: 'VIEW_ASSESSMENTS', name: 'view assessments', group: 'Assessments' },
    {
        key: 'MANAGE_ASSESSMENTS',
        name: 'manage assessments',
        group: 'Assessments',
    },
    {
        key: 'DELETE_ASSESSMENTS',
        name: 'delete assessments',
        group: 'Assessments',
    },

    { key: 'VIEW_REPORTS', name: 'view reports', group: 'Reports' },
    { key: 'MANAGE_REPORTS', name: 'manage reports', group: 'Reports' },
    { key: 'DELETE_REPORTS', name: 'delete reports', group: 'Reports' },

    {
        key: 'VIEW_REPORTING_TOOLS',
        name: 'view reporting_tools',
        group: 'Reporting Tools',
    },
    {
        key: 'MANAGE_REPORTING_TOOLS',
        name: 'manage reporting_tools',
        group: 'Reporting Tools',
    },

    {
        key: 'VIEW_ROLES_PERMISSIONS',
        name: 'view roles_permissions',
        group: 'Roles and Permissions',
    },
    {
        key: 'MANAGE_ROLES_PERMISSIONS',
        name: 'manage roles_permissions',
        group: 'Roles and Permissions',
    },

    {
        key: 'MANAGE_CAREGIVERS',
        name: 'manage caregivers',
        group: 'Caregiver Management',
    },
    {
        key: 'VIEW_CAREGIVERS',
        name: 'view caregivers',
        group: 'Caregiver Management',
    },
    {
        key: 'VIEW_ALL_CAREGIVERS',
        name: 'view all caregivers',
        group: 'Caregiver Management',
    },
    {
        key: 'DELETE_CAREGIVERS',
        name: 'delete caregivers',
        group: 'Caregiver Management',
    },
    {
        key: 'VIEW_TEMPLATES',
        name: 'view templates',
        group: 'Mail Templates'
    },
    {
        key: 'MANAGE_TEMPLATES',
        name: 'manage templates',
        group: 'Mail Templates'
    },
    {
        key: 'DELETE_TEMPLATES',
        name: 'delete templates',
        group: 'Mail Templates'
    },
    {
        key: 'VIEW_QUESTIONNAIRE_BUNDLES',
        name: 'view questionnaire bundles',
        group: 'Questionnaire Bundles',
    },
    {
        key: 'MANAGE_QUESTIONNAIRE_BUNDLES',
        name: 'manage questionnaire bundles',
        group: 'Questionnaire Bundles',
    },
    {
        key: 'DELETE_QUESTIONNAIRE_BUNDLES',
        name: 'delete questionnaire bundles',
        group: 'Questionnaire Bundles',
    },
] as const;

/**
 * Below code create PermissionEnum constant as infered type
 * from the above permissions list, for typing and compatibility
 * with its usage as an enum.
 */
type PermissionType = {
    [key in typeof systemPermissions[number]['key']]: string;
};

const flattenedPermissions = {} as PermissionType;
for (const permission of systemPermissions) {
    flattenedPermissions[permission.key] = permission.name;
}

export const PermissionEnum = flattenedPermissions;
