import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.submission.deleteMany();
  await prisma.task.deleteMany();

  console.log('Database cleared. Create real tasks through POST /api/tasks.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
