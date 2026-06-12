const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireModule } = require('../middleware/permissions');
const { logActivity } = require('../utils/activity');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/points', authenticate, requireModule('access'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const points = await prisma.accessPoint.findMany({
      orderBy: { name: 'asc' }
    });

    const pointsWithCounts = await Promise.all(
      points.map(async (point) => {
        const todayEntries = await prisma.accessLog.count({
          where: {
            accessPointId: point.id,
            timestamp: { gte: today }
          }
        });

        return { ...point, todayEntries };
      })
    );

    res.json({ success: true, data: pointsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/logs', authenticate, requireModule('access'), async (req, res) => {
  try {
    const logs = await prisma.accessLog.findMany({
      include: {
        accessPoint: { select: { name: true } },
        user: { select: { firstName: true, lastName: true, email: true, avatar: true } }
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/unlock', authenticate, requireModule('access'), async (req, res) => {
  try {
    const { accessPointId } = req.body;

    if (!accessPointId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Access point is required' }
      });
    }

    const point = await prisma.accessPoint.findUnique({ where: { id: accessPointId } });

    if (!point) {
      return res.status(404).json({
        success: false,
        error: { message: 'Access point not found' }
      });
    }

    if (point.status !== 'online') {
      return res.status(400).json({
        success: false,
        error: { message: `${point.name} is offline and cannot be unlocked` }
      });
    }

    if (point.isUnlocked) {
      return res.status(400).json({
        success: false,
        error: { message: `${point.name} is already unlocked` }
      });
    }

    const [updatedPoint, log] = await prisma.$transaction([
      prisma.accessPoint.update({
        where: { id: accessPointId },
        data: { isUnlocked: true, unlockedAt: new Date() }
      }),
      prisma.accessLog.create({
        data: {
          accessPointId,
          userId: req.user.id,
          direction: 'entry',
          method: 'remote',
          result: 'granted',
          reason: 'Remote unlock'
        },
        include: {
          accessPoint: { select: { name: true } },
          user: { select: { firstName: true, lastName: true, avatar: true } }
        }
      })
    ]);

    await logActivity({
      userId: req.user.id,
      action: 'remote_unlock',
      module: 'access',
      description: `Unlocked ${point.name}`,
      metadata: { accessPointId: point.id }
    });

    if (req.io) {
      req.io.emit('access-state', {
        accessPointId: point.id,
        isUnlocked: true,
        accessPointName: point.name
      });
    }

    res.json({
      success: true,
      message: `${point.name} unlocked — tap Remote Lock when done`,
      data: { point: updatedPoint, log }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/lock', authenticate, requireModule('access'), async (req, res) => {
  try {
    const { accessPointId } = req.body;

    if (!accessPointId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Access point is required' }
      });
    }

    const point = await prisma.accessPoint.findUnique({ where: { id: accessPointId } });

    if (!point) {
      return res.status(404).json({
        success: false,
        error: { message: 'Access point not found' }
      });
    }

    if (!point.isUnlocked) {
      return res.status(400).json({
        success: false,
        error: { message: `${point.name} is already locked` }
      });
    }

    const updatedPoint = await prisma.accessPoint.update({
      where: { id: accessPointId },
      data: { isUnlocked: false, unlockedAt: null }
    });

    await logActivity({
      userId: req.user.id,
      action: 'remote_lock',
      module: 'access',
      description: `Locked ${point.name}`,
      metadata: { accessPointId: point.id }
    });

    if (req.io) {
      req.io.emit('access-state', {
        accessPointId: point.id,
        isUnlocked: false,
        accessPointName: point.name
      });
    }

    res.json({
      success: true,
      message: `${point.name} locked successfully`,
      data: { point: updatedPoint }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
