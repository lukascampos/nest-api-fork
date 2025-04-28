import { UnauthorizedException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Role } from '@prisma/client'; 
import { UserPayload } from '@/domain/auth/jwt.strategy';

interface User {
  id: string;
  role: Role;
}

@Injectable()
export class ListUserService {

  constructor(private readonly prisma: PrismaService ){}

  async findAll(requestingUser: UserPayload) {
    
    const { sub, role } = requestingUser;
    if (role === 'ADMIN') {
      return this.prisma.user.findMany({
        where: {isDisabled: false}, 
        include: { profile: true, artisan: true },
      });
    }

    if (role === 'MODERATOR') {
      return this.prisma.user.findMany({
        where: { 
          role: 'USER',
          isDisabled: false,
         },
        include: { profile: true, artisan: true },
      });
    }

    if (role === 'USER' || role === 'ARTISAN') {
      const user = await this.prisma.user.findUnique({
        where: { id: sub },
        include: { profile: true, artisan: true },
      });
  
      if (!user || user.isDisabled) {
        throw new UnauthorizedException('Usuário desativado ou não encontrado');
      }
  
      return user;
    }

    throw new UnauthorizedException('Acesso negado');
  }
}






