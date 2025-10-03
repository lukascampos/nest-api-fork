/* eslint-disable no-console */
import { PrismaClient, Roles } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient(); // Move this to the top

async function main() {
  console.log('🌱 Seed Likes: starting...');

  // Import PrismaService type
  const { PrismaService } = await import('../src/shared/prisma/prisma.service');
  const { ProductsRepository } = await import('../src/domain/repositories/products.repository');
  const { ProductLikesRepository } = await import('../src/domain/repositories/product-likes.repository');
  const { ToggleProductLikeUseCase } = await import('../src/domain/products/core/use-cases/toggle-product-like.use-case');
  const { GetProductLikeStatusUseCase } = await import('../src/domain/products/core/use-cases/get-product-like-status.use-case');
  const { ListProductLikesUseCase } = await import('../src/domain/products/core/use-cases/list-product-likes.use-case');

  // Create actual PrismaService instance
  const prismaService = new PrismaService();
  await prismaService.onModuleInit();

  // Instantiate repositories and use cases
  const productsRepo = new ProductsRepository(prismaService);
  const likesRepo = new ProductLikesRepository(prismaService);

  const toggleUC = new ToggleProductLikeUseCase(likesRepo, productsRepo, prismaService);
  const statusUC = new GetProductLikeStatusUseCase(likesRepo, productsRepo);
  const listUC = new ListProductLikesUseCase(likesRepo, productsRepo);

  console.log('🧹 Limpando tabelas antes da seed...');
  await prisma.productLike.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany(); // Adicione esta linha
  await prisma.artisanProfile.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  // Create test data...
  const senha = await hash('123456', 10);

  // Create users
  const [user, admin, moderator, artisan1, artisan2] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'user@test.com',
        password: senha,
        roles: [Roles.USER],
        name: 'Test User',
        phone: '12996575863',
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: senha,
        roles: [Roles.ADMIN],
        name: 'Admin User',
        phone: '12996575864',
      },
    }),
    prisma.user.create({
      data: {
        email: 'moderator@test.com',
        password: senha,
        roles: [Roles.MODERATOR],
        name: 'Moderator User',
        phone: '12996575865',
      },
    }),
    prisma.user.create({
      data: {
        email: 'artisan1@test.com',
        password: senha,
        roles: [Roles.ARTISAN],
        name: 'Artisan One',
        phone: '12996575866',
      },
    }),
    prisma.user.create({
      data: {
        email: 'artisan2@test.com',
        password: senha,
        roles: [Roles.ARTISAN],
        name: 'Artisan Two',
        phone: '12996575867',
      },
    }),
  ]);

  // Create user profiles
  await Promise.all([
    prisma.userProfile.create({
      data: {
        userId: user.id,
        phone: '+5511987654321', // Add required phone field
      },
    }),
    prisma.userProfile.create({
      data: {
        userId: admin.id,
        phone: '+5511987654322', // Add required phone field
      },
    }),
    prisma.userProfile.create({
      data: {
        userId: moderator.id,
        phone: '+5511987654323', // Add required phone field
      },
    }),
    prisma.userProfile.create({
      data: {
        userId: artisan1.id,
        phone: '+5511987654324', // Add required phone field
      },
    }),
    prisma.userProfile.create({
      data: {
        userId: artisan2.id,
        phone: '+5511987654325', // Add required phone field
      },
    }),
  ]);

  // Create artisan profiles (only for artisans)
  const [artisanProfile1, artisanProfile2] = await Promise.all([
    prisma.artisanProfile.create({
      data: {
        userId: artisan1.id,
        artisanUserName: 'artesanum1',
        rawMaterial: ['madeira', 'metal'],
        technique: ['escultura', 'soldagem'],
        finalityClassification: ['decorativo', 'utilitario'],
        sicab: 'SICAB001',
        sicabRegistrationDate: new Date('2023-01-01'),
        sicabValidUntil: new Date('2025-01-01'),
        bio: 'Artesão especializado em trabalhos com madeira e metal',
      },
    }),
    prisma.artisanProfile.create({
      data: {
        userId: artisan2.id,
        artisanUserName: 'artesanum2',
        rawMaterial: ['ceramica', 'argila'],
        technique: ['ceramica', 'tornear'],
        finalityClassification: ['decorativo', 'utensilio'],
        sicab: 'SICAB002',
        sicabRegistrationDate: new Date('2023-02-01'),
        sicabValidUntil: new Date('2025-02-01'),
        bio: 'Artesã especializada em cerâmica e trabalhos com argila',
      },
    }),
  ]);

  // Create category
  const category = await prisma.productCategory.create({
    data: {
      nameExhibit: 'Teste Categoria',
      nameFilter: 'teste-categoria',
      description: 'Descrição da categoria de teste',
      isActive: true,
      rawMaterialIds: [],
      techniqueIds: [],
    },
  });

  // Create products for both artisans
  const [product1, product2] = await Promise.all([
    prisma.product.create({
      data: {
        artisanId: artisanProfile1.userId,
        title: 'Escultura de Madeira',
        description: 'Linda escultura feita à mão em madeira nobre',
        priceInCents: BigInt(15000),
        categoryIds: [BigInt(category.id)],
        stock: 3,
        slug: 'escultura-madeira-artesanum1',
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        artisanId: artisanProfile2.userId,
        title: 'Vaso de Cerâmica',
        description: 'Vaso decorativo feito em cerâmica artesanal',
        priceInCents: BigInt(8000),
        categoryIds: [BigInt(category.id)],
        stock: 5,
        slug: 'vaso-ceramica-artesanum2',
        isActive: true,
      },
    }),
  ]);

  // Test the use cases with both products
  console.log('\n🔹 TESTANDO likes em produtos de ambos artesãos...');

  // User likes product 1
  const like1Result = await toggleUC.execute({
    userId: user.id,
    productId: product1.slug,
  });
  console.log('User curtiu produto 1:', like1Result);

  // Admin likes product 2
  const like2Result = await toggleUC.execute({
    userId: admin.id,
    productId: product2.slug,
  });
  console.log('Admin curtiu produto 2:', like2Result);

  // User also likes product 2
  const like3Result = await toggleUC.execute({
    userId: user.id,
    productId: product2.slug,
  });
  console.log('User curtiu produto 2:', like3Result);

  // Test status on both products
  console.log('\n🔹 VERIFICANDO status dos likes...');
  const status1 = await statusUC.execute({
    userId: user.id,
    productId: product1.slug,
  });
  console.log('Status produto 1:', status1);

  const status2 = await statusUC.execute({
    userId: user.id,
    productId: product2.slug,
  });
  console.log('Status produto 2:', status2);

  // Test listing likes for both products
  console.log('\n🔹 LISTANDO likes dos produtos...');
  const list1 = await listUC.execute({
    productId: product1.slug,
    page: 1,
    limit: 10,
  });
  console.log('Likes produto 1:', JSON.stringify(list1, null, 2));

  const list2 = await listUC.execute({
    productId: product2.slug,
    page: 1,
    limit: 10,
  });

  console.log('Likes produto 2:', JSON.stringify(list2, null, 2));

  console.log('🌱 Seed Likes: completed with comprehensive test data!');

  // Don't forget to cleanup
  await prismaService.onModuleDestroy();
}

main()
  .catch((e) => {
    console.error('❌ Seed Likes error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
