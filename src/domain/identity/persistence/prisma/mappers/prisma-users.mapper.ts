import { User as PrismaUser, UserProfile as PrismaUserProfile, Prisma } from '@prisma/client';
import { User, UserRole } from '@/domain/identity/core/entities/user.entity';

export class PrismaUsersMapper {
  static toDomain(user: PrismaUser & { profile: PrismaUserProfile }): User {
    return User.create({
      name: user.profile.name,
      socialName: user.profile.socialName ?? undefined,
      email: user.email,
      password: user.password,
      roles: user.role as UserRole[],
      cpf: user.profile.cpf,
      birthDate: user.profile.birthDate.toISOString(),
      phone: user.profile.phone ?? '',
    });
  }

  static toPrisma(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      role: user.roles as UserRole[],
      profile: {
        create: {
          name: user.name,
          socialName: user.socialName ?? undefined,
          cpf: user.cpf,
          birthDate: new Date(user.birthDate),
          phone: user.phone,
        },
      },
    };
  }
}
