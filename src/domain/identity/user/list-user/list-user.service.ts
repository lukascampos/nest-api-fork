import { UnauthorizedException, Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { UserPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';

@Injectable()
export class ListUserService {
  constructor(private readonly prisma: PrismaService) { }

  async execute(requestingUser: UserPayload) {
    const { sub, roles } = requestingUser;

    if (roles.includes('ADMIN')) {
      return this.prisma.user.findMany({
        include: { profile: true, artisan: true },
      });
    }

    if (roles.includes('MODERATOR')) {
      return this.prisma.user.findMany({
        where: { role: { has: 'ARTISAN' }, isDisabled: false },
        include: { profile: true, artisan: true },
      });
    }

    if (roles.includes('ARTISAN') || roles.includes('USER')) {
      const result = await this.prisma.user.findUnique({
        where: { id: sub },
        include: { profile: true, artisan: true },
      });

      if (!result || result.isDisabled) {
        throw new UnauthorizedException('User disabled or not found.');
      }

      return result;
    }

    return new BadRequestException('You cannot list another user');
  }
}
