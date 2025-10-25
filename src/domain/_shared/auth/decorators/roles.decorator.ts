import { SetMetadata } from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: PrismaRoles[]) => SetMetadata(ROLES_KEY, roles);
