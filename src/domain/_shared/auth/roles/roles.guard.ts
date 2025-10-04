import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('Autenticação necessária');
    }

    if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      throw new ForbiddenException('Usuário não possui nenhuma função atribuída');
    }

    const hasRequiredRole = this.checkRolePermission(user.roles, requiredRoles);

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Acesso negado. Funções necessárias ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }

  private checkRolePermission(userRoles: Roles[], requiredRoles: Roles[]): boolean {
    return requiredRoles.some((requiredRole) => userRoles.includes(requiredRole));
  }
}
