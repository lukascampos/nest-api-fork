import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class UpdateUserToModeratorService {
  constructor(private readonly prisma: PrismaService) {}

  async updateUserRole(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`The user with the provided ID (${userId}) does not exist.`);
    }

    user.role.push('MODERATOR');

    const newRole = user.role;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        role: newRole,
      },
    });
  }
}
