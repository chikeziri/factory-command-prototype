const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/kpis', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalEmployees,
      presentToday,
      activeMachines,
      totalMachines,
      inventoryItems,
      openAlerts,
      monthlyRevenue,
      monthlyExpenses,
      machineStatuses,
      alertSeverities
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.attendanceRecord.count({
        where: { date: { gte: today }, status: { in: ['PRESENT', 'LATE'] } }
      }),
      prisma.machine.count({ where: { status: { in: ['RUNNING', 'OPERATIONAL'] } } }),
      prisma.machine.count(),
      prisma.inventoryItem.findMany({
        select: { quantityOnHand: true, reorderPoint: true, unitCost: true }
      }),
      prisma.alert.count({ where: { status: { in: ['pending', 'sent'] } } }),
      prisma.journalEntry.aggregate({
        where: { sourceModule: 'sales', date: { gte: monthStart } },
        _sum: { totalCredit: true }
      }),
      prisma.journalEntry.aggregate({
        where: { sourceModule: { in: ['payroll', 'expense'] }, date: { gte: monthStart } },
        _sum: { totalDebit: true }
      }),
      prisma.machine.groupBy({
        by: ['status'],
        _count: { _all: true }
      }),
      prisma.alert.groupBy({
        by: ['severity'],
        where: { status: { in: ['pending', 'sent'] } },
        _count: { _all: true }
      })
    ]);

    const lowStockItems = inventoryItems.filter(
      (item) => Number(item.quantityOnHand) <= Number(item.reorderPoint)
    ).length;

    const totalInventoryValue = inventoryItems.reduce(
      (sum, item) => sum + Number(item.quantityOnHand) * Number(item.unitCost),
      0
    );

    const machineBreakdown = machineStatuses.reduce((acc, item) => {
      acc[item.status] = item._count._all;
      return acc;
    }, {});

    const alertBreakdown = alertSeverities.reduce((acc, item) => {
      acc[item.severity] = item._count._all;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        employees: { total: totalEmployees, present: presentToday },
        machines: {
          active: activeMachines,
          total: totalMachines,
          breakdown: machineBreakdown
        },
        inventory: { totalValue: totalInventoryValue, lowStock: lowStockItems },
        alerts: { open: openAlerts, breakdown: alertBreakdown },
        finance: {
          monthlyRevenue: monthlyRevenue._sum.totalCredit || 0,
          monthlyExpenses: monthlyExpenses._sum.totalDebit || 0
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/activity', authenticate, async (req, res) => {
  try {
    const recentAlerts = await prisma.alert.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        message: true,
        severity: true,
        module: true,
        status: true,
        createdAt: true
      }
    });

    const recentAccess = await prisma.accessLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: { accessPoint: { select: { name: true } } }
    });

    res.json({
      success: true,
      data: { recentAlerts, recentAccess }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
