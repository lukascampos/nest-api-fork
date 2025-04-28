import { UnauthorizedException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Role } from '@prisma/client'; 

interface User {
  id: string;
  role: Role;
}

@Injectable()
export class ListUserService {

  constructor(
    private readonly prisma: PrismaService // injecao o PrismaService para acesso ao banco
  ){}

  async findAll(requestingUser: User) {
    console.log('Prisma:', this.prisma);
    const { id, role } = requestingUser; // Desestruturacao do objeto "Usuario" recebido
    if (role === Role.ADMIN) {
      console.log('Admin acessando todos os usuários');
      // Admin pode ver todos os usuários
      return this.prisma.user.findMany({
        where: {isDisabled: false}, // Adicionando filtro para usuários não desativados
        include: { profile: true, artisan: true },
      });
    }

    if (role === Role.MODERATOR) {
      // Moderador vê apenas "Usuarios"
      return this.prisma.user.findMany({
        where: { 
          role: Role.USER,
          isDisabled: false,
         },
        include: { profile: true, artisan: true },
      });
    }

    if (role === Role.USER || role === Role.ARTISAN) {
      // Usuários e artesao veem apenas os próprios dados
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: { profile: true, artisan: true },
      });
  
      if (!user || user.isDisabled) {
        throw new UnauthorizedException('Usuário desativado ou não encontrado');
      } // Garantia de que o usuário existe e não está desativado para listagem
  
      return user;
    }

    throw new UnauthorizedException('Acesso negado');
  }
}






