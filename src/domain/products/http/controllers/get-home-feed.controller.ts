import {
  Controller, Get, Query,
} from '@nestjs/common';
import { GetHomeFeedUseCase } from '../../core/use-cases/get-home-feed.use-case';
import { Public } from '@/domain/_shared/auth/decorators/public.decorator';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';

@Controller('home')
export class GetHomeFeedController {
  constructor(private readonly getHomeFeedUseCase: GetHomeFeedUseCase) {}

  @Get()
  @Public()
  async handle(
    @CurrentUser() user: TokenPayload | null,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    const result = await this.getHomeFeedUseCase.execute({
      userId: user?.sub || undefined,
      limit: parsedLimit,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw error;
    }

    return {
      data: result.value,
    };
  }
}
