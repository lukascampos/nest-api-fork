import {
  Body, Controller, Post,
} from '@nestjs/common';
import { AuthenticateService } from './authenticate.service';
import { AuthenticateDto } from './authenticate.dto';

@Controller('/sessions')
export class AuthenticateController {
  constructor(
    private readonly authenticateService: AuthenticateService,
  ) {}

  @Post()
  async handle(@Body() body: AuthenticateDto) {
    return this.authenticateService.execute(body);
  }
}
