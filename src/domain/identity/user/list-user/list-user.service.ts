import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Role } from '@prisma/client'; 

interface User {
  id: string;
  role: Role;
}

export class ListUserService {
  constructor(private prisma: PrismaService) { }

  async findAll(requestingUser: User) {
    const { role, id } = requestingUser;

    if (role === Role.ADMIN) { // Admin pode ver todos os usuários
      return this.prisma.user.findMany({
        //include: { profile: true, artisan: true },
      });
    }

    if (role === Role.MODERATOR) {
      // Moderador vê apenas "Usuarios"
      return this.prisma.user.findMany({
        where: { role: Role.USER },
        //include: { profile: true, artisan: true },
      });
    }

    if (role === Role.USER || role === Role.ARTISAN) {  // Usuários e artesãos veem apenas os próprios dados
      return this.prisma.user.findUnique({
        where: { id },
        //include: { profile: true, artisan: true },
      });
    }

    throw new UnauthorizedException('Acesso negado');
  }
}






