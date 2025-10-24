import {
  BadRequestException,
  Controller, Delete, Logger, UseGuards,
} from '@nestjs/common';
import { DeleteAccountUseCase } from '../../core/use-cases/delete-account.use-case';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class DeleteAccountController {
  private readonly logger = new Logger(DeleteAccountController.name);

  constructor(private readonly deleteAccountUseCase: DeleteAccountUseCase) {}

  @Delete()
  async handle(@CurrentUser() user: { sub: string }) {
    this.logger.log('DELETE /account', { userId: user.sub });

    const result = await this.deleteAccountUseCase.execute({
      userId: user.sub,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof UserNotFoundError) {
        this.logger.error('User not found', { userId: user.sub });
        throw new BadRequestException(error);
      }

      throw error;
    }

    return {
      message: result.value.message,
      data: result.value.deletedResources,
    };
  }
}
