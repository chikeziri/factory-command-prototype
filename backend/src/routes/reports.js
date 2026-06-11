const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/production-summary', authenticate, async (req, res) => {
  try {
    const orders = await prisma.productionOrder.findMany({
      where: { status: 'COMPLETED' }
    });

    const summary = {
      totalOrders: orders.length,
      totalTarget: orders.reduce((sum, o) => sum + o.quantityTarget, 0),
      totalActual: orders.reduce((sum, o) => sum + o.quantityActual, 0),
      completionRate: orders.length > 0 
        ? (orders.reduce((sum, o) => sum + o.quantityActual, 0) / 
           orders.reduce((sum, o) => sum + o.quantityTarget, 0) * 100).toFixed(1)
        : 0
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
