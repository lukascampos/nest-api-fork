import {
  Controller,
  Post,
  Body,
  ConflictException,
  BadRequestException,
  Res,
  Req,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { CreateUserDto } from '../dtos/create-user.dto';
import { Public } from '@/domain/_shared/auth/decorators/public.decorator';
import { InvalidUserDataError } from '../../core/errors/invalid-user-data.error';
import { UserAlreadyExistsError } from '../../core/errors/user-already-exists.error';
import { CreateUserUseCase } from '../../core/use-cases/create-user.use-case';

@Controller('users')
export class CreateUserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @Public()
  async handle(
    @Body() body: CreateUserDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const ipHost = request.ip || request.socket.remoteAddress || 'unknown';
    const userAgent = request.get('User-Agent') || 'unknown';

    const result = await this.createUserUseCase.execute({
      ...body,
      ipHost,
      userAgent,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new ConflictException(error.message);
        case InvalidUserDataError:
          throw new BadRequestException(error.message);
        default:
          throw new InternalServerErrorException('Erro interno do servidor');
      }
    }

    const { user, session } = result.value;

    response.cookie('access_token', session.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/',
    });

    response.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        socialName: user.socialName,
        email: user.email,
        roles: user.roles,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    });
  }
}
