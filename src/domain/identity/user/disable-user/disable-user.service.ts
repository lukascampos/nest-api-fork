import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { UserPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';

@Injectable()
export class DisableUserService {
  constructor(private readonly prisma: PrismaService) {}

  async disableUser(userId: string, currentUser: UserPayload) {
    const { sub: currentUserId, role: currentUserRole } = currentUser;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (currentUserId === userId) {
      return this.prisma.user.update({
        where: { id: userId },
        data: { isDisabled: true },
      });
    }

    if (currentUserRole.includes(Role.ADMIN)) {
      return this.prisma.user.update({
        where: { id: userId },
        data: { isDisabled: true },
      });
    }

    if (currentUserRole.includes(Role.MODERATOR) && user.role.includes(Role.ARTISAN)) {
      return this.prisma.user.update({
        where: { id: userId },
        data: { isDisabled: true },
      });
    }

    throw new ForbiddenException('You do not have permission to disable this user');
  }
}
