import { Injectable, Inject } from '@nestjs/common';
import { RequestStatus } from '@prisma/client';
import { ArtisanApplicationsRepository } from '../repositories/artisan-applications.repository';
import { ArtisanApplication, ArtisanApplicationStatus } from '../entities/artisan-application.entity';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class RequestDisableArtisanUseCase {
  constructor(
    @Inject('ArtisanApplicationsRepository')
    private readonly repo: ArtisanApplicationsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(userId: string): Promise<ArtisanApplication> {
    // Garante que não há solicitação pendente
    const pendings = await this.repo.findByUserId(userId);
    if (pendings?.some((p) => p.status === RequestStatus.PENDING)) {
      throw new Error('Já existe uma solicitação pendente para este usuário');
    }
    // Busca perfil existente
    const profile = await this.prisma.artisanProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new Error('Perfil de artesão não encontrado');
    }
    // Cria nova aplicação de desativação
    const application = ArtisanApplication.create({
      userId: profile.userId,
      rawMaterial: profile.rawMaterial,
      technique: profile.technique,
      finalityClassification: profile.finalityClassification,
      sicab: profile.sicab,
      sicabRegistrationDate: profile.sicabRegistrationDate,
      sicabValidUntil: profile.sicabValidUntil,
      status: ArtisanApplicationStatus.PENDING,
      reviewerId: undefined,
      rejectionReason: undefined,
    });
    await this.repo.save(application);
    return application;
  }
}
