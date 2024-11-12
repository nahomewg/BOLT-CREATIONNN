const { execSync } = require('child_process');

// Run Prisma migrations
try {
  console.log('Running Prisma migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('Migrations completed successfully');
} catch (error) {
  console.error('Error running migrations:', error);
  process.exit(1);
}

// Generate Prisma Client
try {
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma Client generated successfully');
} catch (error) {
  console.error('Error generating Prisma Client:', error);
  process.exit(1);
}