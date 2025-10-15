import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { UserAlreadyExistsError } from '../errors/user-already-exists.error';
import { InvalidUserDataError } from '../errors/invalid-user-data.error';
import { InvalidAttachmentError } from '../errors/invalid-attachment.error';
import { AttachmentsRepository } from '@/domain/repositories/attachments.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';

export interface UpdatePersonalProfileDataInput {
  userId: string;
  newName?: string;
  newSocialName?: string | null;
  newPhone?: string;
  newAvatarId?: string;
}

export interface UpdatePersonalProfileDataOutput {
  id: string;
  name: string;
  socialName?: string | null;
  phone: string;
  email: string;
  avatar?: string | null;
}

type Output = Either<
  UserNotFoundError | UserAlreadyExistsError | InvalidUserDataError | InvalidAttachmentError,
  { user: UpdatePersonalProfileDataOutput }
>;

@Injectable()
export class UpdatePersonalProfileDataUseCase {
  private readonly logger = new Logger(UpdatePersonalProfileDataUseCase.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly attachmentsRepository: AttachmentsRepository,
    private readonly s3AttachmentsStorage: S3StorageService,
    private readonly prisma: PrismaService,
  ) {}

  async execute({
    userId,
    newName,
    newSocialName,
    newPhone,
    newAvatarId,
  }: UpdatePersonalProfileDataInput): Promise<Output> {
    try {
      this.logger.debug(`Updating profile for user: ${userId}`);

      const user = await this.usersRepository.findById(userId);

      if (!user) {
        this.logger.warn(`User not found: ${userId}`);
        return left(new UserNotFoundError(userId, 'id'));
      }

      const validationResult = await this.validateUniqueFields(userId, newPhone);
      if (validationResult) {
        return left(validationResult);
      }

      const avatarValidationResult = await this.validateAndProcessAvatar(newAvatarId, userId);
      if (avatarValidationResult.isLeft()) {
        return left(avatarValidationResult.value);
      }

      const updatedUser = await this.updateUserInTransaction(
        userId,
        {
          newName, newSocialName, newPhone, newAvatarId,
        },
      );

      const avatar = await this.generateAvatarUrl(updatedUser.avatar);

      this.logger.log(`Profile updated successfully for user: ${userId}`);

      return right({
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          socialName: updatedUser.socialName,
          phone: updatedUser.phone,
          email: updatedUser.email,
          avatar,
        },
      });
    } catch (error) {
      this.logger.error(`Error updating profile for user ${userId}:`, error);

      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'campo';
        return left(new UserAlreadyExistsError('valor duplicado', field));
      }

      return left(new InvalidUserDataError('Erro interno do servidor'));
    }
  }

  private async validateUniqueFields(
    userId: string,
    newPhone?: string,
  ): Promise<UserAlreadyExistsError | null> {
    if (!newPhone) return null;

    const existingUserWithPhone = await this.usersRepository.findByPhone(newPhone);

    if (existingUserWithPhone && existingUserWithPhone.id !== userId) {
      this.logger.warn(`Phone number already in use: ${newPhone}`);
      return new UserAlreadyExistsError(newPhone, 'phone');
    }

    return null;
  }

  private async validateAndProcessAvatar(
    newAvatarId?: string,
    userId?: string,
  ): Promise<Either<InvalidAttachmentError, void>> {
    if (!newAvatarId) {
      return right(undefined);
    }

    try {
      const attachment = await this.attachmentsRepository.findById(newAvatarId);

      if (!attachment) {
        this.logger.warn(`Avatar attachment not found: ${newAvatarId}`);
        return left(new InvalidAttachmentError(`Avatar não encontrado: ${newAvatarId}`));
      }

      if (attachment.userId && attachment.userId !== userId) {
        this.logger.warn(`Avatar already linked to another user: ${newAvatarId}`);
        return left(new InvalidAttachmentError('Avatar já está vinculado a outro usuário'));
      }

      this.logger.debug(`Avatar validation successful: ${newAvatarId}`);
      return right(undefined);
    } catch (error) {
      this.logger.error(`Error validating avatar: ${newAvatarId}`, error);
      return left(new InvalidAttachmentError('Erro ao processar avatar'));
    }
  }

  private async updateUserInTransaction(
    userId: string,
    updates: {
      newName?: string;
      newSocialName?: string | null;
      newPhone?: string;
      newAvatarId?: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updateData: {
        updatedAt: Date;
        name?: string;
        socialName?: string | null;
        phone?: string;
        avatar?: string;
      } = {
        updatedAt: new Date(),
      };

      if (updates.newName) {
        updateData.name = updates.newName;
        this.logger.debug(`Updating name for user ${userId}`);
      }

      if (updates.newSocialName !== undefined) {
        updateData.socialName = updates.newSocialName;
        this.logger.debug(`Updating social name for user ${userId}`);
      }

      if (updates.newPhone) {
        updateData.phone = updates.newPhone;
        this.logger.debug(`Updating phone for user ${userId}`);
      }

      if (updates.newAvatarId) {
        updateData.avatar = updates.newAvatarId;
        this.logger.debug(`Updating avatar for user ${userId}`);

        await tx.attachment.update({
          where: { id: updates.newAvatarId },
          data: { userId },
        });
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          socialName: true,
          phone: true,
          email: true,
          avatar: true,
        },
      });

      if (updates.newPhone) {
        await tx.user.update({
          where: { id: userId },
          data: { phone: updates.newPhone },
        });
      }

      return updatedUser;
    });
  }

  private async generateAvatarUrl(avatarId: string | null): Promise<string | null> {
    if (!avatarId) {
      return null;
    }

    try {
      const url = await this.s3AttachmentsStorage.getUrlByFileName(avatarId);
      this.logger.debug(`Generated avatar URL for attachment: ${avatarId}`);
      return url;
    } catch (urlError) {
      this.logger.warn(`Failed to generate avatar URL for attachment ${avatarId}:`, urlError);
      return null;
    }
  }
}
