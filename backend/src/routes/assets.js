const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        assignments: {
          orderBy: { assignedAt: 'desc' },
          take: 1,
          include: { user: { select: { firstName: true, lastName: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
