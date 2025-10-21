import {
  Controller,
  Get,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';
import { GetMyProfileUseCase } from '../../core/use-cases/get-my-profile.use-case';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';

@Controller('users')
export class GetMyProfileController {
  constructor(
    private readonly getMyProfileUseCase: GetMyProfileUseCase,
  ) {}

  @Get('me')
  async handle(@CurrentUser() user: TokenPayload) {
    const result = await this.getMyProfileUseCase.execute({
      userId: user.sub,
      userRoles: user.roles,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new InternalServerErrorException('Erro interno do servidor');
      }
    }

    const { user: profileData } = result.value;

    return {
      message: 'Perfil recuperado com sucesso',
      user: profileData,
    };
  }
}
