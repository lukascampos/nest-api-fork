import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Patch,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateOwnPasswordUseCase } from '../../core/use-cases/update-own-password.use-case';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';
import { InvalidPasswordError } from '../../core/errors/invalid-password.error';
import { SamePasswordError } from '../../core/errors/same-password.error';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { UpdateOwnPasswordDto } from '../dtos/update-own-password.use-case';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class UpdateOwnPasswordController {
  private readonly logger = new Logger(UpdateOwnPasswordController.name);

  constructor(
    private readonly updateOwnPasswordUseCase: UpdateOwnPasswordUseCase,
  ) {}

  @Patch('password')
  @HttpCode(HttpStatus.OK)
  async handle(
    @CurrentUser() user: TokenPayload,
    @Body() body: UpdateOwnPasswordDto,
  ) {
    this.logger.log('PATCH /users/me/password', { userId: user.sub });

    const result = await this.updateOwnPasswordUseCase.execute({
      userId: user.sub,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof UserNotFoundError) {
        this.logger.error('User not found', { userId: user.sub });
        throw new BadRequestException('User not found');
      }

      if (error instanceof InvalidPasswordError) {
        this.logger.warn('Invalid current password', { userId: user.sub });
        throw new UnauthorizedException('Current password is incorrect');
      }

      if (error instanceof SamePasswordError) {
        this.logger.warn('Same password provided', { userId: user.sub });
        throw new BadRequestException(
          'New password must be different from current password',
        );
      }

      throw error;
    }

    return {
      message: result.value.message,
    };
  }
}
