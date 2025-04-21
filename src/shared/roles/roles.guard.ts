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
    const { user } = request;

    // console.log('[RolesGuard] Required:', requiredRoles);
    // console.log('[RolesGuard] User:', user);

    if (!requiredRoles) return true;

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
