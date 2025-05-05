import { BadRequestException, Injectable } from '@nestjs/common';
<<<<<<< HEAD
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface CreateArtisanInput {
=======
import { PrismaService } from '@/shared/prisma/prisma.service';

interface CreateArtisanInput {
  userId: string;
>>>>>>> 02056ddc10d5566d3993c49fe2417ba999ca94f0
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

<<<<<<< HEAD
  async execute(userId: string, input: CreateArtisanInput, tx?: Prisma.TransactionClient) {
    const prismaClient = tx ?? this.prisma;

    const createArtisanRequestExists = await this.prisma.artisanCreationRequest.findFirst({
      where: {
        userId,
      },
    });

    if (createArtisanRequestExists) {
      throw new BadRequestException('Request already exists. Status of the request: ', createArtisanRequestExists.status);
    }

    const artisanProfile = await prismaClient.artisanProfile.create({
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

    const artisanCreationRequest = await prismaClient.artisanCreationRequest.create({
=======
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
>>>>>>> 02056ddc10d5566d3993c49fe2417ba999ca94f0
      data: {
        userId,
      },
    });
<<<<<<< HEAD

    return {
      ...artisanProfile,
      status: artisanCreationRequest.status,
    };
=======
>>>>>>> 02056ddc10d5566d3993c49fe2417ba999ca94f0
  }
}
