import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { DisableUserDto } from './disable-user.dto';
import { UserPayload } from '@/domain/auth/jwt.strategy';

@Injectable()
export class DisableUserService {
  constructor(private readonly prisma: PrismaService) {}

  async disableUser(dto: DisableUserDto, currentUser: UserPayload) {
    const { userId } = dto;
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
    if (currentUserRole === Role.ADMIN) {
      return this.prisma.user.update({
        where: { id: userId },
        data: { isDisabled: true },
      });
    }

    if (currentUserRole === Role.MODERATOR && user.role === Role.ARTISAN) {
      return this.prisma.user.update({
        where: { id: userId },
        data: { isDisabled: true },
      });
    }
    throw new ForbiddenException('You do not have permission to disable this user');
  }
}
