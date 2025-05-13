import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../../_shared/auth/decorators/roles.decorator';

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

    if (!requiredRoles) return true;

    if (!user || !user.role || !Array.isArray(user.role)) {
      throw new UnauthorizedException('User not authenticated or without defined role');
    }

    const hasRole = user.role.some((role: Role) => requiredRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('You do not have permission to access this route');
    }

    return true;
  }
}
