import { BadRequestException, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface CreateUserInput {
  email: string;
  password: string;
  cpf: string;
  socialName?: string;
  name: string;
  dtBirth: string;
  phone: string;
}

@Injectable()
export class CreateUserService {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    email,
    password,
    cpf,
    dtBirth,
    name,
    phone,
    socialName,
  }: CreateUserInput) {
    const userExists = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (userExists) {
      throw new BadRequestException(`User ${email} already exists.`);
    }

    const passwordHashed = await hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: passwordHashed,
        role: 'USER',
      },
    });

    const userProfileAlreadyExists = await this.prisma.user_Profile.findFirst({
      where: {
        cpf,
      },
    });

    if (userProfileAlreadyExists) {
      throw new BadRequestException('User CPF already exists.');
    }

    await this.prisma.user_Profile.create({
      data: {
        cpf,
        dt_birth: new Date(dtBirth),
        name,
        social_name: socialName || null,
        phone,
        fk_user_id: user.id,
      },
    });
  }
}
