import { BadRequestException, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
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
  }: CreateUserInput, tx?: Prisma.TransactionClient) {
    const prismaClient = tx ?? this.prisma;

    const userExists = await prismaClient.user.findFirst({
      where: {
        email,
      },
    });

    if (userExists) {
      throw new BadRequestException(`User ${email} already exists.`);
    }

    const passwordHashed = await hash(password, 10);

    const user = await prismaClient.user.create({
      data: {
        email,
        password: passwordHashed,
        role: [Role.USER],
      },
    });

    const userProfileAlreadyExists = await prismaClient.userProfile.findFirst({
      where: {
        cpf,
      },
    });

    if (userProfileAlreadyExists) {
      throw new BadRequestException('User CPF already exists.');
    }

    await prismaClient.userProfile.create({
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
      id: user.id,
      accessToken,
      role: user.role,
    };
  }
}
