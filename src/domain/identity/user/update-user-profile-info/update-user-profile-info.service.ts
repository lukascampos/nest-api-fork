import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

interface UpdateuserProfileInput {
  userId: string;
  name?: string;
  socialName?: string;
  phone?: string;
  avatar?: string;
}

@Injectable()
export class UpdateUserProfileInfoService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute({
    userId, name, socialName, phone, avatar,
  }: UpdateuserProfileInput) {
    const user = await this.prisma.userProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.userProfile.update({
      where: {
        userId,
      },
      data: {
        name,
        socialName,
        phone,
        avatar,
      },
    });
  }
}
