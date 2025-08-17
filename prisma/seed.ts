/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import {
  PrismaClient, Role, ApplicationType, RequestStatus,
} from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Criar categorias de produto
  const categories = await prisma.productCategory.createMany({
    data: [
      { id: 1, name: 'Artesanato', type: 'manual' },
      { id: 2, name: 'Decoração', type: 'decor' },
      { id: 3, name: 'Utilidades', type: 'utility' },
    ],
    skipDuplicates: true,
  });

  // Criar ao menos um usuário para cada role
  const roles = [Role.USER, Role.ARTISAN, Role.MODERATOR, Role.ADMIN];
  const users: Awaited<ReturnType<typeof prisma.user.create>>[] = [];
  for (const role of roles) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: [role],
      },
    });
    users.push(user);
  }
  // Adiciona mais usuários aleatórios
  for (let i = 0; i < 2; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: [faker.helpers.arrayElement(roles)],
      },
    });
    users.push(user);
  }

  // Criar perfis de usuário
  for (const user of users) {
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        name: faker.person.fullName(),
        socialName: faker.person.fullName(),
        cpf: faker.string.numeric('###########'),
        birthDate: faker.date.birthdate(),
        street: faker.location.street(),
        postalCode: faker.location.zipCode(),
        city: faker.location.city(),
        number: faker.string.numeric('####'),
        phone: faker.phone.number(),
        avatar: faker.image.avatar(),
      },
    });
  }

  // Criar perfis de artesão para alguns usuários
  const artisanUsers = users.slice(0, 3);
  const artisans: Awaited<ReturnType<typeof prisma.artisanProfile.create>>[] = [];
  for (const user of artisanUsers) {
    const artisan = await prisma.artisanProfile.create({
      data: {
        userId: user.id,
        userName: faker.internet.username(),
        rawMaterial: faker.commerce.productMaterial(),
        technique: faker.commerce.productAdjective(),
        finalityClassification: faker.commerce.department(),
        sicab: faker.string.alphanumeric(8),
        sicabRegistrationDate: faker.date.past(),
        sicabValidUntil: faker.date.future(),
        isDisabled: faker.datatype.boolean(),
      },
    });
    artisans.push(artisan);
  }

  // Criar aplicações de artesão
  for (const user of artisanUsers) {
    await prisma.artisanApplication.create({
      data: {
        userId: user.id,
        type: faker.helpers.arrayElement([ApplicationType.BE_ARTISAN, ApplicationType.DISABLE_PROFILE]),
        rawMaterial: faker.commerce.productMaterial(),
        technique: faker.commerce.productAdjective(),
        finalityClassification: faker.commerce.department(),
        sicab: faker.string.alphanumeric(8),
        sicabRegistrationDate: faker.date.past(),
        sicabValidUntil: faker.date.future(),
        status: faker.helpers.arrayElement([RequestStatus.PENDING, RequestStatus.APPROVED, RequestStatus.REJECTED]),
        reviewerId: users[4].id,
        rejectionReason: faker.lorem.sentence(),
      },
    });
  }

  // Criar produtos para cada artesão
  for (const artisan of artisans) {
    for (let i = 0; i < 2; i++) {
      const product = await prisma.product.create({
        data: {
          artisanId: artisan.userId,
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          priceInCents: BigInt(faker.number.int({ min: 1000, max: 10000 })),
          categoryId: faker.helpers.arrayElement([1, 2, 3]),
          stock: faker.number.int({ min: 1, max: 50 }),
          coverageImage: faker.image.urlPicsumPhotos(),
          isDisabled: faker.datatype.boolean(),
        },
      });
      // Criar attachments para produto
      await prisma.attachment.create({
        data: {
          productId: product.id,
          fileType: 'image/png',
          fileSize: BigInt(faker.number.int({ min: 10000, max: 500000 })),
        },
      });
      // Criar ratings e likes
      for (const user of users) {
        await prisma.productRating.create({
          data: {
            productId: product.id,
            userId: user.id,
            rating: faker.number.int({ min: 1, max: 5 }),
            comment: faker.lorem.sentence(),
          },
        });
        await prisma.productLike.create({
          data: {
            productId: product.id,
            userId: user.id,
            isLiked: faker.datatype.boolean(),
            likedAt: faker.date.recent(),
            likeDeletedAt: faker.datatype.boolean() ? faker.date.recent() : null,
          },
        });
      }
    }
  }

  // Criar attachments para usuários e artesãos
  for (const user of users) {
    await prisma.attachment.create({
      data: {
        userId: user.id,
        fileType: 'image/jpeg',
        fileSize: BigInt(faker.number.int({ min: 10000, max: 500000 })),
      },
    });
  }
  for (const artisan of artisans) {
    await prisma.attachment.create({
      data: {
        artisanId: artisan.id,
        fileType: 'image/jpeg',
        fileSize: BigInt(faker.number.int({ min: 10000, max: 500000 })),
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
