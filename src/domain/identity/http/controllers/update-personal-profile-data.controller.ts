import {
  Controller,
  Put,
  Body,
  ConflictException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { InvalidUserDataError } from '../../core/errors/invalid-user-data.error';
import { UserAlreadyExistsError } from '../../core/errors/user-already-exists.error';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';
import { InvalidAttachmentError } from '../../core/errors/invalid-attachment.error';
import { UpdatePersonalProfileDataUseCase } from '../../core/use-cases/update-personal-profile-data.use-case';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { UpdatePersonalProfileDataDto } from '../dtos/update-personal-profile-data.dto';

@Controller('users')
export class UpdatePersonalProfileDataController {
  constructor(
    private readonly updatePersonalProfileDataUseCase: UpdatePersonalProfileDataUseCase,
  ) {}

  @Put('me/profile')
  async handle(
    @Body() body: UpdatePersonalProfileDataDto,
    @CurrentUser() user: TokenPayload,
  ) {
    const result = await this.updatePersonalProfileDataUseCase.execute({
      userId: user.sub,
      newName: body.name,
      newSocialName: body.socialName,
      newPhone: body.phone,
      newAvatarId: body.avatarId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        case UserAlreadyExistsError:
          throw new ConflictException(error.message);
        case InvalidUserDataError:
          throw new BadRequestException(error.message);
        case InvalidAttachmentError:
          throw new BadRequestException(error.message);
        default:
          throw new InternalServerErrorException('Erro interno do servidor');
      }
    }

    const { user: updatedUser } = result.value;

    return {
      message: 'Perfil atualizado com sucesso',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        socialName: updatedUser.socialName,
        phone: updatedUser.phone,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      },
    };
  }
}
