import { Body, Controller, Post } from '@nestjs/common';
import { RegisterWithArtisanService } from './register-with-artisan.service';
import { RegisterWithArtisanDto } from './register-with-artisan.dto';
import { Public } from '@/domain/_shared/auth/decorators/public.decorator';

@Controller('users/register-with-artisan')
export class RegisterWithArtisanController {
  constructor(
    private readonly registerWithArtisan: RegisterWithArtisanService,
  ) {}

  @Post()
  @Public()
  async handle(@Body() body: RegisterWithArtisanDto) {
    const { artisan, user } = body;

    return this.registerWithArtisan.execute({ artisan, user });
  }
}
