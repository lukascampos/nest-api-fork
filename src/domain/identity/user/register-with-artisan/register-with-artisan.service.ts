import { Injectable } from '@nestjs/common';
import { CreateUserInput, CreateUserService } from '../create-user/create-user.service';
import { CreateArtisanInput, CreateArtisanService } from '../../artisan/create-artisan/create-artisan.service';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface RegisterWithArtisanInput {
  user: CreateUserInput;
  artisan: CreateArtisanInput;
}

@Injectable()
export class RegisterWithArtisanService {
  constructor(
    private readonly createUser: CreateUserService,
    private readonly createArtisan: CreateArtisanService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: RegisterWithArtisanInput) {
    return this.prisma.$transaction(async (tx) => {
      const user = await this.createUser.execute(input.user, tx);
      const artisan = await this.createArtisan.execute(user.id, input.artisan);

      return { user, artisan };
    });
  }
}
