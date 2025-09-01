import {
  BadRequestException, Controller, Get, NotFoundException, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { GetArtisanProfileByUsernameUseCase } from '../../core/use-cases/get-artisan-profile-by-username.use-case';
import { Public } from '@/domain/_shared/auth/decorators/public.decorator';
import { UsernameParamDto } from '../dtos/username-param.dto';
import { ArtisanProfileNotFoundError } from '../../core/errors/artisan-profile-not-found.error';

@Controller('artisan-profile/:username')
@UseGuards(JwtAuthGuard)
export class GetArtisanProfileByUsernameController {
  constructor(
    private readonly getArtisanProfileByUsernameUseCase: GetArtisanProfileByUsernameUseCase,
  ) {}

  @Get()
  @Public()
  async handle(@Param() param: UsernameParamDto) {
    const { username } = param;

    const result = await this.getArtisanProfileByUsernameUseCase.execute({ username });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ArtisanProfileNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }
}
