import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface CreateArtisanInput {
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

  async execute(userId: string, input: CreateArtisanInput) {
    const createArtisanRequestExists = await this.prisma.artisanCreationRequest.findFirst({
      where: {
        userId,
      },
    });

    if (createArtisanRequestExists) {
      throw new BadRequestException('Request already exists. Status of the request: ', createArtisanRequestExists.status);
    }

    const artisanProfile = await this.prisma.artisanProfile.create({
      data: {
        userId,
        rawMaterial: input.rawMaterial,
        technique: input.technique,
        finalityClassification: input.finalityClassification,
        sicab: input.sicab,
        sisabRegistrationDate: new Date(input.sisabRegistrationDate),
        sisabValidUntil: new Date(input.sisabValidUntil),
      },
    });

    const artisanCreationRequest = await this.prisma.artisanCreationRequest.create({
      data: {
        userId,
      },
    });

    return {
      ...artisanProfile,
      status: artisanCreationRequest.status,
    };
  }
}
