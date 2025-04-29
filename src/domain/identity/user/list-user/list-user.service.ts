import { UnauthorizedException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Role } from '@prisma/client';
import { UserPayload } from '@/domain/auth/jwt.strategy';


@Injectable()
export class ListUserService {

  constructor(private readonly prisma: PrismaService) { }

  async findAll(requestingUser: UserPayload) {
    const { sub, role } = requestingUser
    switch (role) {
      case Role.ADMIN:
        return this.prisma.user.findMany({
          include: { profile: true, artisan: true },
        });

      case Role.MODERATOR:
        return this.prisma.user.findMany({
          where: { role: Role.USER, isDisabled: false },
          include: { profile: true, artisan: true },
        });

      case Role.USER:
      case Role.ARTISAN: {
        const result = await this.prisma.user.findUnique({
          where: { id: sub },
          include: { profile: true, artisan: true },
        });

        if (!result || result.isDisabled) {
          throw new UnauthorizedException('User disabled or not found.');
        }

        return result;
      }

      default:
        throw new UnauthorizedException('Access denied.');
    }
  }
}






