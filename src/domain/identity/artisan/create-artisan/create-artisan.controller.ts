import { Body, Controller, Post } from '@nestjs/common';
import { CreateArtisanService } from './create-artisan.service';
import { CurrentUser } from '@/domain/auth/current-user.decorator';
import { CreateArtisanDto } from './create-artisan.dto';

@Controller('artisans')
export class CreateArtisanController {
  constructor(
    private readonly createArtisan: CreateArtisanService,
  ) {}

  @Post()
  async handle(@CurrentUser() userId: string, @Body() body: CreateArtisanDto) {
    await this.createArtisan.execute({
      userId,
      ...body,
    });
  }
}
