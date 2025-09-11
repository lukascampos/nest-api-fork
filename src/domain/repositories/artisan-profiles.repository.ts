import { Injectable } from '@nestjs/common';
import { ArtisanProfile } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface CreateArtisanProfileData {
  userId: string;
  artisanUserName: string;
  rawMaterial: string[];
  technique: string[];
  finalityClassification: string[];
  sicab: string;
  sicabRegistrationDate: Date;
  sicabValidUntil: Date;
  bio?: string;
  followersCount: number;
  productsCount: number;
  isDisabled: boolean;
}

export interface UpdateArtisanProfileData {
  rawMaterial?: string[];
  technique?: string[];
  finalityClassification?: string[];
  sicab?: string;
  sicabRegistrationDate?: Date;
  sicabValidUntil?: Date;
  bio?: string;
  isDisabled?: boolean;
}

@Injectable()
export class ArtisanProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateArtisanProfileData): Promise<ArtisanProfile> {
    return this.prisma.artisanProfile.create({
      data,
    });
  }

  async findById(id: string): Promise<ArtisanProfile | null> {
    return this.prisma.artisanProfile.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<ArtisanProfile | null> {
    return this.prisma.artisanProfile.findUnique({
      where: { userId },
    });
  }

  async findByUserName(userName: string): Promise<ArtisanProfile | null> {
    return this.prisma.artisanProfile.findUnique({
      where: { artisanUserName: userName },
    });
  }

  async update(id: string, data: UpdateArtisanProfileData): Promise<ArtisanProfile> {
    return this.prisma.artisanProfile.update({
      where: { id },
      data,
    });
  }
}
