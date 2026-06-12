const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middleware/auth');
const { requireModule } = require('../middleware/permissions');
const { OWNER_ONLY_MODULES, ALL_MODULES, DEFAULT_ROLE_MODULES } = require('../lib/permissions');
const { logActivity } = require('../utils/activity');
const { serializeUser } = require('../utils/userResponse');

const router = express.Router();
const prisma = new PrismaClient();

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  department: true,
  phone: true,
  avatar: true,
  isActive: true,
  mustChangePassword: true,
  modulePermissions: true,
  lastLoginAt: true,
  createdAt: true
};

router.get('/', authenticate, requireModule('team'), requireRole('TENANT_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: users.map(serializeUser)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/', authenticate, requireModule('team'), requireRole('TENANT_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, department, phone, modulePermissions = [] } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email, password, first name, last name, and role are required' }
      });
    }

    if (role === 'TENANT_ADMIN' || role === 'SUPER_ADMIN') {
      return res.status(400).json({
        success: false,
        error: { message: 'Only one factory owner account is allowed' }
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: { message: 'A user with this email already exists' }
      });
    }

    const safePermissions = Array.isArray(modulePermissions)
      ? modulePermissions.filter((module) => ALL_MODULES.includes(module) && !OWNER_ONLY_MODULES.includes(module))
      : [];

    const user = await prisma.user.create({
      data: {
        email,
        password: bcrypt.hashSync(password, 10),
        firstName,
        lastName,
        role,
        department,
        phone,
        modulePermissions: safePermissions,
        mustChangePassword: true
      },
      select: userSelect
    });

    await logActivity({
      userId: req.user.id,
      action: 'create_user',
      module: 'team',
      description: `Created account for ${firstName} ${lastName} (${email})`,
      metadata: { createdUserId: user.id, role }
    });

    res.status(201).json({
      success: true,
      data: serializeUser(user),
      message: 'Staff account created. They must change their password on first login.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.put('/:id/permissions', authenticate, requireModule('team'), requireRole('TENANT_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { modulePermissions = [] } = req.body;

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    if (target.role === 'TENANT_ADMIN' || target.role === 'SUPER_ADMIN') {
      return res.status(400).json({ success: false, error: { message: 'Owner permissions cannot be changed' } });
    }

    const safePermissions = Array.isArray(modulePermissions)
      ? modulePermissions.filter((module) => ALL_MODULES.includes(module) && !OWNER_ONLY_MODULES.includes(module))
      : [];

    const user = await prisma.user.update({
      where: { id },
      data: { modulePermissions: safePermissions },
      select: userSelect
    });

    await logActivity({
      userId: req.user.id,
      action: 'update_permissions',
      module: 'team',
      description: `Updated module access for ${user.firstName} ${user.lastName}`,
      metadata: { targetUserId: id, modulePermissions: safePermissions }
    });

    res.json({ success: true, data: serializeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.put('/:id/status', authenticate, requireModule('team'), requireRole('TENANT_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    if (target.role === 'TENANT_ADMIN' || target.role === 'SUPER_ADMIN') {
      return res.status(400).json({ success: false, error: { message: 'Owner account cannot be deactivated' } });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
      select: userSelect
    });

    res.json({ success: true, data: serializeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/:id/reset-password', authenticate, requireModule('team'), requireRole('TENANT_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { message: 'Password must be at least 6 characters' }
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        password: bcrypt.hashSync(password, 10),
        mustChangePassword: true
      },
      select: userSelect
    });

    res.json({
      success: true,
      message: 'Temporary password set. User must change it on next login.',
      data: serializeUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/profile/avatar', authenticate, async (req, res) => {
  try {
    const { imageData } = req.body;

    if (!imageData || !imageData.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        error: { message: 'A valid image file is required' }
      });
    }

    const matches = imageData.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ success: false, error: { message: 'Invalid image format' } });
    }

    const extension = matches[1].split('/')[1].replace('jpeg', 'jpg');
    const buffer = Buffer.from(matches[2], 'base64');
    const uploadsDir = path.join(__dirname, '../../uploads/avatars');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${req.user.id}.${extension}`;
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);

    const avatarPath = `/uploads/avatars/${filename}`;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: avatarPath },
      select: userSelect
    });

    await logActivity({
      userId: req.user.id,
      action: 'update_avatar',
      module: 'settings',
      description: `${user.firstName} ${user.lastName} updated profile photo`
    });

    res.json({ success: true, data: serializeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/modules/options', authenticate, requireRole('TENANT_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  res.json({
    success: true,
    data: {
      allModules: ALL_MODULES,
      ownerOnlyModules: OWNER_ONLY_MODULES,
      defaultRoleModules: DEFAULT_ROLE_MODULES
    }
  });
});

module.exports = router;
