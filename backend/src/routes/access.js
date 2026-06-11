const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/points', authenticate, async (req, res) => {
  try {
    const points = await prisma.accessPoint.findMany({
      include: { _count: { select: { accessLogs: true } } }
    });

    res.json({ success: true, data: points });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/logs', authenticate, async (req, res) => {
  try {
    const logs = await prisma.accessLog.findMany({
      include: { accessPoint: { select: { name: true } } },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/unlock', authenticate, async (req, res) => {
  try {
    const { accessPointId } = req.body;

    // Simulate unlock
    await prisma.accessLog.create({
      data: {
        accessPointId,
        direction: 'entry',
        method: 'remote',
        result: 'granted',
        reason: 'Remote unlock by admin'
      }
    });

    res.json({ success: true, message: 'Door unlocked remotely' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
