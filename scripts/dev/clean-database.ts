/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function cleanDatabase() {
  // Important order due to foreign keys
  console.log('Starting database cleanup...');

  await prisma.productLike.deleteMany();
  console.log('✓ Product likes removed');

  await prisma.productRating.deleteMany();
  console.log('✓ Product ratings removed');

  await prisma.attachment.deleteMany();
  console.log('✓ Attachments removed');

  await prisma.product.deleteMany();
  console.log('✓ Products removed');

  await prisma.artisanApplication.deleteMany();
  console.log('✓ Artisan applications removed');

  await prisma.artisanProfile.deleteMany();
  console.log('✓ Artisan profiles removed');

  await prisma.userProfile.deleteMany();
  console.log('✓ User profiles removed');

  await prisma.user.deleteMany();
  console.log('✓ Users removed');

  await prisma.productCategory.deleteMany();
  console.log('✓ Product categories removed');

  console.log('Database cleaned successfully!');
}

cleanDatabase()
  .catch((e) => {
    console.error('❌ Error cleaning database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
