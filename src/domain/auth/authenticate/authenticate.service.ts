import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { PrismaService } from '@/shared/prisma/prisma.service';

interface AuthenticateInput {
  email: string;
  password: string;
}

@Injectable()
export class AuthenticateService {
  constructor(
      private readonly jwt: JwtService,
      private readonly prisma: PrismaService,
  ) {}

  async execute({ email, password }: AuthenticateInput) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const doesPasswordMatches = await compare(password, user.password);

      if (!doesPasswordMatches) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const userInfo = await this.prisma.userProfile.findUnique({
        where: {
          userId: user.id,
        },
      });

      const accessToken = this.jwt.sign({ sub: user.id, role: user.role });

      return {
        accessToken, role: user.role, name: userInfo?.name, avatar: userInfo?.avatar,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
