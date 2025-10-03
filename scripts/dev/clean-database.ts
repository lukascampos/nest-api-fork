/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function cleanDatabase() {
  // Ordem importante devido às foreign keys
  console.log(' Iniciando limpeza do banco de dados...');

  await prisma.productLike.deleteMany();
  console.log('✓ Likes de produtos removidos');

  await prisma.productRating.deleteMany();
  console.log('✓ Avaliações de produtos removidas');

  await prisma.attachment.deleteMany();
  console.log('✓ Anexos removidos');

  await prisma.product.deleteMany();
  console.log('✓ Produtos removidos');

  await prisma.artisanApplication.deleteMany();
  console.log('✓ Solicitações de artesão removidas');

  await prisma.artisanProfile.deleteMany();
  console.log('✓ Perfis de artesão removidos');

  await prisma.userProfile.deleteMany();
  console.log('✓ Perfis de usuário removidos');

  await prisma.user.deleteMany();
  console.log('✓ Usuários removidos');

  await prisma.productCategory.deleteMany();
  console.log('✓ Categorias de produtos removidas');

  console.log(' Banco de dados limpo com sucesso!');
}

cleanDatabase()
  .catch((e) => {
    console.error('❌ Erro ao limpar banco:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
