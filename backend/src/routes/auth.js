const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole, JWT_SECRET } = require('../middleware/auth');
const { logActivity } = require('../utils/activity');
const { serializeUser } = require('../utils/userResponse');

const router = express.Router();
const prisma = new PrismaClient();
const isDemoMode = process.env.DEMO_MODE === 'true';

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

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' }
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    const demoPasswordAllowed = isDemoMode && password === 'demo123' && !user.mustChangePassword;

    if (!passwordMatches && !demoPasswordAllowed) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    await logActivity({
      userId: user.id,
      action: 'login',
      module: 'auth',
      description: `${user.firstName} ${user.lastName} signed in`
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: serializeUser(user)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'LOGIN_ERROR', message: error.message }
    });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: userSelect
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }

    res.json({ success: true, data: serializeUser(user) });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid token' }
    });
  }
});

router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: { message: 'New password must be at least 6 characters' }
      });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user.mustChangePassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          error: { message: 'Current password is required' }
        });
      }

      const currentMatches = await bcrypt.compare(currentPassword, user.password);
      if (!currentMatches) {
        return res.status(400).json({
          success: false,
          error: { message: 'Current password is incorrect' }
        });
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: bcrypt.hashSync(newPassword, 10),
        mustChangePassword: false
      },
      select: userSelect
    });

    await logActivity({
      userId: user.id,
      action: 'change_password',
      module: 'auth',
      description: `${user.firstName} ${user.lastName} changed password`
    });

    res.json({
      success: true,
      message: 'Password updated successfully',
      data: serializeUser(updated)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
