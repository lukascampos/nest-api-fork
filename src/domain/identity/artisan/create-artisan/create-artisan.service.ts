import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

interface CreateArtisanInput {
  userId: string;
  rawMaterial: string;
  technique: string;
  finalityClassification: string;
  sicab: string;
  sisabRegistrationDate: string;
  sisabValidUntil: string;
}

@Injectable()
export class CreateArtisanService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute({
    userId,
    rawMaterial,
    technique,
    finalityClassification,
    sicab,
    sisabRegistrationDate,
    sisabValidUntil,
  }: CreateArtisanInput) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('User does not exists');
    }

    await this.prisma.artisanProfile.create({
      data: {
        userId,
        rawMaterial,
        technique,
        finalityClassification,
        sicab,
        sisabRegistrationDate,
        sisabValidUntil,
      },
    });

    await this.prisma.artisanCreationRequest.create({
      data: {
        userId,
      },
    });
  }
}
