import {
  Body, Controller, Post, UseGuards,
} from '@nestjs/common';
import { CreateArtisanService } from './create-artisan.service';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { CreateArtisanDto } from './create-artisan.dto';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { UserPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';

@Controller('artisans')
@UseGuards(JwtAuthGuard)
export class CreateArtisanController {
  constructor(
    private readonly createArtisan: CreateArtisanService,
  ) {}

  @Post()
  async handle(@CurrentUser() userId: UserPayload, @Body() body: CreateArtisanDto) {
    await this.createArtisan.execute(userId.sub, body);
  }
}
