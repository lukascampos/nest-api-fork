import {
  BadRequestException, Controller, ForbiddenException, Get, Query,
  UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client'; // ← Importar o enum
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { NotAllowedError } from '../../core/errors/not-allowed.error';
import { RequestFailedError } from '../../core/errors/request-failed.error';
import { SearchUsersUseCase } from '../../core/use-cases/search-users.use-case';
import { ListUsersQueryDto } from '../dtos/search-users.dto';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SearchUsersController {
  constructor(private readonly searchUsersUseCase: SearchUsersUseCase) {}

  @Roles(PrismaRoles.ADMIN)
  @Get()
  async handle(
    @Query() query: ListUsersQueryDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    const result = await this.searchUsersUseCase.execute({
      requesterId: currentUser.sub,
      filters: {
        id: query.id,
        email: query.email,
        cpf: query.cpf,
        search: query.search,
        role: query.role,
        status: query.status,
        page: query.page || 1,
        limit: query.limit || 10,
        sortBy: query.sortBy || 'createdAt',
        sortOrder: query.sortOrder || 'desc',
      },
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NotAllowedError:
          throw new ForbiddenException(error.message);
        case RequestFailedError:
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException('Erro na busca de usuários');
      }
    }

    return result.value;
  }
}
