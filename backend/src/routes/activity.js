const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireModule } = require('../middleware/permissions');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, requireModule('activity'), async (req, res) => {
  try {
    const { module, action, limit = 100 } = req.query;

    const where = {};
    if (module) where.module = module;
    if (action) where.action = action;

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit) || 100, 200)
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
