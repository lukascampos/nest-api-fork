import { BadRequestException, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface CreateUserInput {
  email: string;
  password: string;
}

@Injectable()
export class CreateUserService {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ email, password }: CreateUserInput) {
    const userExists = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (userExists) {
      throw new BadRequestException(`User ${email} already exists.`);
    }

    const passwordHashed = await hash(password, 10);

    await this.prisma.user.create({
      data: {
        email,
        password: passwordHashed,
        role: 'USER',
      },
    });
  }
}
