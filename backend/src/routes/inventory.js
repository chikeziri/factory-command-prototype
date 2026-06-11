const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/items', authenticate, async (req, res) => {
  try {
    const { category, warehouse, lowStock } = req.query;
    const where = {};

    if (category) where.category = category;
    if (warehouse) where.warehouseId = warehouse;
    if (lowStock === 'true') {
      where.quantityOnHand = { lte: prisma.inventoryItem.fields.reorderPoint };
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      include: { warehouse: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/warehouses', authenticate, async (req, res) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: { _count: { select: { items: true } } }
    });

    res.json({ success: true, data: warehouses });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/movements', authenticate, async (req, res) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      include: { item: { select: { name: true, sku: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ success: true, data: movements });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
