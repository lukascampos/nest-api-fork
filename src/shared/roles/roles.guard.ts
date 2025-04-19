import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();

    // extrai diretamente o parâmetro da query
    const roleFromQuery = request.user?.role;
    console.log(roleFromQuery); // Verifica o que está sendo passado no request.user

    if (!requiredRoles) return true;

    const { user } = request;

    if (!user || !user.role) {
      throw new ForbiddenException('Usuário não autenticado ou sem papel definido');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException('Você não tem permissão para acessar essa rota');
    }

    return true;
  }
}
