import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: 'admin@teste.com',
      password: '1234',
      role: Role.ADMIN,
      profile: {
        create: {
          name: 'Administrador',
          cpf: '12345678900',
          birthDate: new Date('1990-01-01'),
        },
      },
    },
  });

  console.log('Usuário admin criado');
}
