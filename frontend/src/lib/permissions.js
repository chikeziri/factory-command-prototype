import { getApiUrl } from './config'

export const OWNER_ONLY_MODULES = ['settings', 'reports', 'activity', 'team']

export const ALL_MODULES = [
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
  'settings',
]

export const DEFAULT_ROLE_MODULES = {
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
    'alerts',
  ],
  DEPARTMENT_HEAD: ['dashboard', 'attendance', 'machines', 'inventory', 'alerts'],
  OPERATOR: ['dashboard', 'machines', 'attendance', 'alerts'],
  SECURITY: ['dashboard', 'access', 'attendance', 'alerts'],
  VIEWER: ['dashboard', 'alerts'],
}

export const MODULES = {
  dashboard: { path: '/', label: 'Dashboard', key: 'dashboard' },
  attendance: { path: '/attendance', label: 'Attendance', key: 'attendance' },
  access: { path: '/access', label: 'Access Control', key: 'access' },
  machines: { path: '/machines', label: 'Production', key: 'machines' },
  inventory: { path: '/inventory', label: 'Inventory', key: 'inventory' },
  sensors: { path: '/sensors', label: 'Environment', key: 'sensors' },
  assets: { path: '/assets', label: 'Assets', key: 'assets' },
  erp: { path: '/erp', label: 'ERP & Finance', key: 'erp' },
  alerts: { path: '/alerts', label: 'Alerts', key: 'alerts' },
  reports: { path: '/reports', label: 'Reports', key: 'reports', ownerOnly: true },
  activity: { path: '/activity', label: 'Activity Logs', key: 'activity', ownerOnly: true },
  team: { path: '/team', label: 'Team & Accounts', key: 'team', ownerOnly: true },
  settings: { path: '/settings', label: 'Settings', key: 'settings', ownerOnly: true },
}

export const NAV_ITEMS = Object.values(MODULES)

export function isOwnerRole(role) {
  return role === 'TENANT_ADMIN' || role === 'SUPER_ADMIN'
}

export function getUserModules(user) {
  if (!user) return []

  if (user.modules?.length) {
    return user.modules
  }

  if (isOwnerRole(user.role)) {
    return ALL_MODULES
  }

  const custom = Array.isArray(user.modulePermissions) ? user.modulePermissions : []

  if (custom.length > 0) {
    return [...new Set(['dashboard', ...custom.filter((module) => !OWNER_ONLY_MODULES.includes(module))])]
  }

  return DEFAULT_ROLE_MODULES[user.role] || ['dashboard']
}

export function canAccessModule(user, moduleKey) {
  return getUserModules(user).includes(moduleKey)
}

export function getHomePath(user) {
  const modules = getUserModules(user)
  const match = NAV_ITEMS.find((item) => modules.includes(item.key))
  return match?.path || '/'
}

export function isOwner(user) {
  return isOwnerRole(user?.role)
}

export function avatarUrl(user) {
  if (!user?.avatar) return null
  if (user.avatar.startsWith('http')) return user.avatar
  const base = getApiUrl()
  return `${base}${user.avatar}`
}
