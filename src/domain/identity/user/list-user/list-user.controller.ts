import { Controller, Get, ForbiddenException, Request} from '@nestjs/common';
import { ListUserService } from './list-user.service';


@Controller('users')
export class ListUserController {
  constructor(private readonly listUserService: ListUserService) {}

  @Get()
  async findAll(@Request() req) {
    const currentUser = req.user;

    if (currentUser.role !== 'administrador') {
      throw new ForbiddenException('Apenas Administradores podem acessar esta rota');
    }
    
    return this.listUserService.findAll();
  }
}
