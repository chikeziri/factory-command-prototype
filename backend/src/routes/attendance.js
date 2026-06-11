const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/records', authenticate, async (req, res) => {
  try {
    const { date, employee, status } = req.query;
    const where = {};

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      where.date = { gte: d, lt: new Date(d.getTime() + 24 * 60 * 60 * 1000) };
    }
    if (employee) where.employeeId = employee;
    if (status) where.status = status;

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: { employee: { select: { name: true, employeeCode: true, department: true } } },
      orderBy: { clockIn: 'desc' }
    });

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/clock-in', authenticate, async (req, res) => {
  try {
    const { employeeId, method = 'mobile', location } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already clocked in
    const existing = await prisma.attendanceRecord.findFirst({
      where: { employeeId, date: { gte: today } }
    });

    if (existing && existing.clockIn) {
      return res.status(400).json({
        success: false,
        error: { message: 'Already clocked in today' }
      });
    }

    const record = await prisma.attendanceRecord.create({
      data: {
        employeeId,
        date: today,
        clockIn: new Date(),
        method,
        location: location ? JSON.stringify(location) : null,
        status: 'PRESENT'
      },
      include: { employee: { select: { name: true } } }
    });

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/clock-out', authenticate, async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.attendanceRecord.findFirst({
      where: { employeeId, date: { gte: today } }
    });

    if (!record || !record.clockIn) {
      return res.status(400).json({
        success: false,
        error: { message: 'Not clocked in today' }
      });
    }

    const clockOut = new Date();
    const workHours = (clockOut - new Date(record.clockIn)) / (1000 * 60 * 60);
    const overtimeHours = Math.max(0, workHours - 8);

    const updated = await prisma.attendanceRecord.update({
      where: { id: record.id },
      data: {
        clockOut,
        workHours: parseFloat(workHours.toFixed(2)),
        overtimeHours: parseFloat(overtimeHours.toFixed(2))
      },
      include: { employee: { select: { name: true } } }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/employees', authenticate, async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
