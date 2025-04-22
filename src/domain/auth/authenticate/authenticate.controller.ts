import {
  Body, Controller, Post,
} from '@nestjs/common';
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
  async handle(@Body() body: AuthenticateDto) {
    return this.authenticateService.execute(body);
  }
}
