const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function logActivity({ userId, action, module, description, metadata }) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: userId || null,
        action,
        module,
        description,
        metadata: metadata || undefined
      }
    });
  } catch (error) {
    console.error('Activity log failed:', error.message);
  }
}

module.exports = { logActivity };
