import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@/domain/identity/core/repositories/users.repository';
import { User } from '@/domain/identity/core/entities/user.entity';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PrismaUsersMapper } from '../mappers/prisma-users.mapper';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        profile: true,
      },
    });

    if (!user || !user.profile) {
      return null;
    }

    return PrismaUsersMapper.toDomain({
      ...user,
      profile: {
        ...user.profile,
      },
    });
  }

  async findByCpf(cpf: string): Promise<User | null> {
    const user = await this.prisma.userProfile.findUnique({
      where: {
        cpf,
      },
      include: {
        user: true,
      },
    });

    if (!user) {
      return null;
    }

    return PrismaUsersMapper.toDomain({
      ...user.user,
      profile: user,
    });
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: {
        id: user.id,
      },
      create: {
        id: user.id,
        email: user.email,
        password: user.password,
        role: user.roles,
        profile: {
          create: {
            name: user.name,
            socialName: user.socialName,
            cpf: user.cpf,
            birthDate: user.birthDate,
            phone: user.phone,
          },
        },
      },
      update: {
        email: user.email,
        password: user.password,
        role: user.roles,
        profile: {
          update: {
            name: user.name,
            socialName: user.socialName,
            cpf: user.cpf,
            birthDate: user.birthDate,
            phone: user.phone,
          },
        },
      },
    });
  }
}
