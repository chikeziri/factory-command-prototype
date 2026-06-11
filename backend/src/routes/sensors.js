const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  try {
    const sensors = await prisma.sensor.findMany({
      include: {
        readings: { orderBy: { timestamp: 'desc' }, take: 1 }
      }
    });

    res.json({ success: true, data: sensors });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/:id/readings', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { hours = 24 } = req.query;

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const readings = await prisma.sensorReading.findMany({
      where: { 
        sensorId: id,
        timestamp: { gte: since }
      },
      orderBy: { timestamp: 'asc' }
    });

    res.json({ success: true, data: readings });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const sensors = await prisma.sensor.findMany();
    const readings = await prisma.sensorReading.findMany({
      where: { timestamp: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
      orderBy: { timestamp: 'asc' }
    });

    // Group by sensor
    const grouped = {};
    readings.forEach(r => {
      if (!grouped[r.sensorId]) grouped[r.sensorId] = [];
      grouped[r.sensorId].push(r);
    });

    res.json({
      success: true,
      data: { sensors, readings: grouped }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
