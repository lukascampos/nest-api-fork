import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { Roles } from '@prisma/client';
import { InvalidUserDataError } from '../errors/invalid-user-data.error';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { UserAlreadyExistsError } from '../errors/user-already-exists.error';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  socialName?: string;
  phone: string;
  cpf?: string;
  ipHost: string;
  userAgent: string;
}

export interface CreateUserOutput {
  user: {
    id: string;
    name: string;
    socialName?: string;
    email: string;
    roles: Roles[];
  };
  session: {
    id: string;
    accessToken: string;
    expiresAt: Date;
  };
}

type Output = Either<
  UserAlreadyExistsError | InvalidUserDataError,
  CreateUserOutput
>;

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: CreateUserInput): Promise<Output> {
    const {
      email,
      password,
      name,
      socialName,
      phone,
      cpf,
      ipHost,
      userAgent,
    } = input;

    try {
      const [existingEmail, existingPhone, existingCpf] = await Promise.all([
        this.usersRepository.findByEmail(email),
        this.usersRepository.findByPhone(phone),
        cpf ? this.usersRepository.findByCpf(cpf) : null,
      ]);

      if (existingEmail) {
        return left(new UserAlreadyExistsError(email, 'email'));
      }

      if (existingPhone) {
        return left(new UserAlreadyExistsError(phone, 'phone'));
      }

      if (cpf && existingCpf) {
        return left(new UserAlreadyExistsError(cpf, 'cpf'));
      }

      const hashedPassword = await hash(password, 12);

      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            socialName,
            roles: [Roles.USER],
            profile: {
              create: {
                phone,
                cpf,
              },
            },
          },
          select: {
            id: true,
            name: true,
            socialName: true,
            email: true,
            roles: true,
          },
        });

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

        const session = await tx.session.create({
          data: {
            userId: user.id,
            expiresAt,
            ipHost,
            userAgent,
            lastUsedAt: new Date(),
          },
        });

        return { user, session };
      });

      const tokenPayload = {
        sub: result.user.id,
        jti: result.session.id,
        email: result.user.email,
        name: result.user.name,
        roles: result.user.roles,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(result.session.expiresAt.getTime() / 1000),
      };

      const accessToken = await this.jwtService.signAsync(tokenPayload);

      this.logger.log(`User created successfully: ${result.user.id}`);

      return right({
        user: {
          id: result.user.id,
          name: result.user.name,
          socialName: result.user.socialName ?? undefined,
          email: result.user.email,
          roles: result.user.roles,
        },
        session: {
          id: result.session.id,
          accessToken,
          expiresAt: result.session.expiresAt,
        },
      });
    } catch (error) {
      this.logger.error('Error creating user:', error);

      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'campo';
        return left(new UserAlreadyExistsError('valor duplicado', field));
      }

      return left(new InvalidUserDataError('Erro interno do servidor'));
    }
  }
}
