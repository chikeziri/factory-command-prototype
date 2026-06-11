const { execSync } = require('child_process');

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: 'inherit' });
}

try {
  run('npx prisma migrate deploy');
  run('node prisma/seed.js');
  require('../src/index.js');
} catch (error) {
  console.error('Startup failed:', error.message);
  process.exit(1);
}
