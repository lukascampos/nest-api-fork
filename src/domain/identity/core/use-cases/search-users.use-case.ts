import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { Roles } from '@prisma/client';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { NotAllowedError } from '../errors/not-allowed.error';
import { RequestFailedError } from '../errors/request-failed.error';

export interface SearchUsersInput {
  requesterId: string;
  filters: {
    id?: string;
    email?: string;
    cpf?: string;
    search?: string;
    role?: Roles;
    status?: 'active' | 'disabled';
    page: number;
    limit: number;
    sortBy: 'name' | 'email' | 'createdAt';
    sortOrder: 'asc' | 'desc';
  };
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  socialName?: string;
  roles: Roles[];
  isActive: boolean;
  createdAt: Date;
}

export interface SearchUsersOutput {
  users: UserSummary[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    applied: string[];
    total: number;
  };
}

type Output = Either<
  NotAllowedError | ForbiddenException,
  SearchUsersOutput
>;

@Injectable()
export class SearchUsersUseCase {
  private readonly logger = new Logger(SearchUsersUseCase.name);

  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(input: SearchUsersInput): Promise<Output> {
    const { requesterId, filters } = input;

    try {
      const requester = await this.usersRepository.findById(requesterId);

      if (!requester?.roles.includes(Roles.ADMIN)) {
        return left(new NotAllowedError());
      }

      const searchType = this.determineSearchType(filters);

      this.logger.log(`Search type: ${searchType} by user: ${requesterId}`);

      const result = await this.usersRepository.searchUsers({
        id: filters.id,
        email: filters.email,
        cpf: filters.cpf,
        search: filters.search,
        role: filters.role,
        isActive: (() => {
          if (filters.status === 'active') return true;
          if (filters.status === 'disabled') return false;
          return undefined;
        })(),
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      const appliedFilters = this.getAppliedFilters(filters);

      return right({
        users: result.users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          socialName: user.socialName ?? undefined,
          roles: user.roles,
          isActive: !user.isDisabled,
          createdAt: user.createdAt,
        })),
        pagination: {
          total: result.total,
          page: filters.page,
          limit: filters.limit,
          totalPages: Math.ceil(result.total / filters.limit),
        },
        filters: {
          applied: appliedFilters,
          total: appliedFilters.length,
        },
      });
    } catch (error) {
      this.logger.error('Error searching users:', error);
      return left(new RequestFailedError());
    }
  }

  private determineSearchType(filters: SearchUsersInput['filters']): string {
    if (filters.id) return 'BY_ID';
    if (filters.email) return 'BY_EMAIL';
    if (filters.cpf) return 'BY_CPF';
    if (filters.search) return 'TEXT_SEARCH';
    if (filters.role || filters.status) return 'FILTERED_LIST';
    return 'LIST_ALL';
  }

  private getAppliedFilters(filters: SearchUsersInput['filters']): string[] {
    const applied: string[] = [];

    if (filters.id) applied.push(`id: ${filters.id}`);
    if (filters.email) applied.push(`email: ${filters.email}`);
    if (filters.cpf) applied.push(`cpf: ${filters.cpf}`);
    if (filters.search) applied.push(`search: ${filters.search}`);
    if (filters.role) applied.push(`role: ${filters.role}`);
    if (filters.status) applied.push(`status: ${filters.status}`);

    return applied;
  }
}
