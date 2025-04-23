import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UpdateUserToModeratorDto } from './updateUserTo-moderator.dto';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class UpdateUserToModeratorService {
  constructor(private readonly prisma: PrismaService) {}

  async UpdateUserRole({ userId, newRole }: UpdateUserToModeratorDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`The user with the provided ID (${userId}) does not exist.`);
    }

    if (!Object.values(Role).includes(newRole as Role)) {
      throw new BadRequestException(`Invalid role ${newRole}`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        role: newRole as Role,
      },
    });
  }
}
