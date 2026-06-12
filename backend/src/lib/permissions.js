const OWNER_ONLY_MODULES = ['settings', 'reports', 'activity', 'team'];

const ALL_MODULES = [
  'dashboard',
  'attendance',
  'access',
  'machines',
  'inventory',
  'sensors',
  'assets',
  'erp',
  'alerts',
  'reports',
  'activity',
  'team',
  'settings'
];

const DEFAULT_ROLE_MODULES = {
  SUPER_ADMIN: ALL_MODULES,
  TENANT_ADMIN: ALL_MODULES,
  FACTORY_MANAGER: [
    'dashboard',
    'attendance',
    'access',
    'machines',
    'inventory',
    'sensors',
    'assets',
    'erp',
    'alerts'
  ],
  DEPARTMENT_HEAD: ['dashboard', 'attendance', 'machines', 'inventory', 'alerts'],
  OPERATOR: ['dashboard', 'machines', 'attendance', 'alerts'],
  SECURITY: ['dashboard', 'access', 'attendance', 'alerts'],
  VIEWER: ['dashboard', 'alerts']
};

function isOwnerRole(role) {
  return role === 'TENANT_ADMIN' || role === 'SUPER_ADMIN';
}

function getUserModules(user) {
  if (!user) return [];

  if (isOwnerRole(user.role)) {
    return ALL_MODULES;
  }

  const custom = Array.isArray(user.modulePermissions) ? user.modulePermissions : [];

  if (custom.length > 0) {
    return [...new Set(['dashboard', ...custom.filter((module) => !OWNER_ONLY_MODULES.includes(module))])];
  }

  return DEFAULT_ROLE_MODULES[user.role] || ['dashboard'];
}

function userCanAccessModule(user, moduleKey) {
  return getUserModules(user).includes(moduleKey);
}

module.exports = {
  OWNER_ONLY_MODULES,
  ALL_MODULES,
  DEFAULT_ROLE_MODULES,
  isOwnerRole,
  getUserModules,
  userCanAccessModule
};
