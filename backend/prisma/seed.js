const { PrismaClient } = require('@prisma/client');
const { seedDemoData } = require('../src/seed/demoData');

const prisma = new PrismaClient();

async function main() {
  await seedDemoData(prisma);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
