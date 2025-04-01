import { Injectable } from '@nestjs/common';
import { IService } from 'src/core/interfaces/IService';
import { PrismaService } from 'src/shared/prisma/prisma.service';

interface Input {
  name: string;
  email: string;
}

interface Output {
  message?: string;
  error?: {
    error: string;
    message: string;
  }
}

@Injectable()
export class CreateUserService implements IService<Input, Output> {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute({ name, email }: Input) {
    try {
      const userWithSameEmail = await this.prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (userWithSameEmail) {
        return {
          error: {
            error: 'Conflict',
            message: 'User with same e-mail alredy exists.',
          },
        };
      }

      await this.prisma.user.create({
        data: {
          name,
          email,
        },
      });

      return {
        message: `User ${name} successfully created`,
      };
    } catch (error) {
      return {
        error: {
          error: 'Server error',
          message: error.message,
        },
      };
    }
  }
}
