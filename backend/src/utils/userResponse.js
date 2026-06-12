const { getUserModules } = require('../lib/permissions');

function serializeUser(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    department: user.department,
    phone: user.phone,
    avatar: user.avatar,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
    modulePermissions: user.modulePermissions || [],
    modules: getUserModules(user),
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt
  };
}

module.exports = { serializeUser };
