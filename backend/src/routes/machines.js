const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  try {
    const machines = await prisma.machine.findMany({
      include: {
        _count: { select: { telemetry: true, maintenanceRecords: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: machines });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/:id/telemetry', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    const telemetry = await prisma.machineTelemetry.findMany({
      where: { machineId: id },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit)
    });

    res.json({ success: true, data: telemetry.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/:id/oee', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const telemetry = await prisma.machineTelemetry.findMany({
      where: { 
        machineId: id,
        timestamp: { gte: today }
      },
      orderBy: { timestamp: 'asc' }
    });

    // Calculate OEE components
    const totalMinutes = telemetry.length * 5; // 5-min intervals
    const runningMinutes = telemetry.filter(t => t.status === 'running').length * 5;
    const availability = totalMinutes > 0 ? runningMinutes / totalMinutes : 0;

    const totalOutput = telemetry.reduce((sum, t) => sum + (t.outputQuantity || 0), 0);
    const performance = totalOutput / (totalMinutes * 10); // Assume 10 units/min target

    const quality = 0.95; // Simulated quality rate
    const oee = availability * Math.min(performance, 1) * quality;

    res.json({
      success: true,
      data: {
        availability: (availability * 100).toFixed(1),
        performance: (Math.min(performance, 1) * 100).toFixed(1),
        quality: (quality * 100).toFixed(1),
        oee: (oee * 100).toFixed(1),
        totalOutput,
        runningMinutes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const machine = await prisma.machine.findUnique({
      where: { id },
      include: {
        telemetry: { orderBy: { timestamp: 'desc' }, take: 1 },
        productionOrders: { where: { status: 'IN_PROGRESS' } },
        maintenanceRecords: { where: { status: { in: ['scheduled', 'in_progress'] } } }
      }
    });

    if (!machine) {
      return res.status(404).json({ success: false, error: { message: 'Machine not found' } });
    }

    res.json({ success: true, data: machine });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
