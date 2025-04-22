import { BadRequestException, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface CreateUserInput {
  email: string;
  password: string;
  cpf: string;
  socialName?: string;
  name: string;
  birthDate: string;
  phone: string;
}

@Injectable()
export class CreateUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async execute({
    email,
    password,
    cpf,
    birthDate,
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

    const userProfileAlreadyExists = await this.prisma.userProfile.findFirst({
      where: {
        cpf,
      },
    });

    if (userProfileAlreadyExists) {
      throw new BadRequestException('User CPF already exists.');
    }

    await this.prisma.userProfile.create({
      data: {
        cpf,
        birthDate: new Date(birthDate),
        name,
        socialName: socialName || null,
        phone,
        userId: user.id,
      },
    });

    const accessToken = this.jwt.sign({ sub: user.id, role: user.role });

    return {
      accessToken,
      role: user.role,
    };
  }
}
