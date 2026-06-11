const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, severity, module } = req.query;
    const where = {};

    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (module) where.module = module;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.put('/:id/acknowledge', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status: 'acknowledged',
        acknowledgedBy: req.user.id,
        acknowledgedAt: new Date()
      }
    });

    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
