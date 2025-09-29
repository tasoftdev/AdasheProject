const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('DATABASE_URL (from process.env):', process.env.DATABASE_URL ? '[present]' : '[missing]');
    const one = await prisma.user.findFirst();
    console.log('DB query ok — returned:', one);
  } catch (err) {
    console.error('DB connectivity test error:');
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
