import {
  Injectable, BadRequestException,
} from '@nestjs/common';
import { Prisma, RequestStatus, Role } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { UserPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { ReviewDisableArtisanRequestDto } from './disable-artisan.dto';

@Injectable()
export class DisableArtisanService {
  constructor(private readonly prisma: PrismaService) {}

  async createDisableRequest(currentUser: UserPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.sub },
      include: { artisan: true },
    });

    if (!user || !user.role.includes(Role.ARTISAN)) {
      throw new BadRequestException('You are not an artisan or your profile does not exist');
    }

    if (!user || !user.artisan || user.artisan.isDisabled) {
      throw new BadRequestException('Artisan profile not found or already disabled');
    }

    const existingRequest = await this.prisma.artisanCreationRequest.findFirst({
      where: {
        userId: currentUser.sub,
        status: RequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('There is alredy a pending disable request');
    }

    return this.prisma.artisanCreationRequest.create({
      data: {
        userId: currentUser.sub,
        status: RequestStatus.PENDING,
      },
    });
  }

  async reviewDisableRequest(
    dto: ReviewDisableArtisanRequestDto,
    currentUser: UserPayload,
  ) {
    if (!currentUser.role.includes(Role.MODERATOR) && !currentUser.role.includes(Role.ADMIN)) {
      throw new BadRequestException('You are not authorized to review disable requests');
    }

    const request = await this.prisma.artisanCreationRequest.findUnique({
      where: { id: dto.requestId },
      include: { userRequesting: true },
    });
    if (!request) {
      throw new BadRequestException('Disable request not found');
    }
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Disable request is not pending');
    }

    const update: Prisma.ArtisanCreationRequestUpdateInput = {
      status: dto.status,
      reviwedAt: new Date(),
      reason: dto.reason || null,
    };
    if (dto.status === RequestStatus.APPROVED) {
      await this.prisma.artisanProfile.update({
        where: { userId: request.userId },
        data: { isDisabled: true },
      });
    }

    return this.prisma.artisanCreationRequest.update({
      where: { id: dto.requestId },
      data: update,
    });
  }
}
