require('dotenv').config();

const { execSync } = require('child_process');

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: 'inherit', env: process.env });
}

if (!process.env.DATABASE_URL) {
  console.error('');
  console.error('Startup failed: DATABASE_URL is not set.');
  console.error('');
  console.error('On Railway:');
  console.error('  1. Open your backend/API service (root directory: backend)');
  console.error('  2. Go to Variables');
  console.error('  3. Add Reference -> choose your PostgreSQL service -> DATABASE_URL');
  console.error('  4. Redeploy the backend service');
  console.error('');
  console.error('Do not put DATABASE_URL only on the Postgres service — the backend service needs it too.');
  console.error('');
  process.exit(1);
}

try {
  run('npx prisma migrate deploy');
  run('node prisma/seed.js');
  require('../src/index.js');
} catch (error) {
  console.error('Startup failed:', error.message);
  process.exit(1);
}
