import {
  Body, Controller, Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticateService } from './authenticate.service';
import { AuthenticateDto } from './authenticate.dto';
import { Public } from '../public.decorator';

@Controller('/sessions')
export class AuthenticateController {
  constructor(
    private readonly authenticateService: AuthenticateService,
  ) {}

  @Post()
  @Public()
  async handle(@Body() body: AuthenticateDto, @Res() res: Response) {
    const {
      accessToken, role, avatar, name,
    } = await this.authenticateService.execute(body);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.send({
      role, name, avatar,
    });
  }
}
