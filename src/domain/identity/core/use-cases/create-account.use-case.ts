import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { User, UserRole } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';
import { Cryptography } from '../utils/encryption/cryptography';
import { UserAlreadyExistsError } from '../errors/user-already-exists.error';

export interface CreateUserInput {
  email: string;
  password: string;
  cpf: string;
  socialName?: string;
  name: string;
  birthDate: string;
  phone: string;
}

interface CreateUserOutput {
  id: string;
  name: string;
  socialName?: string;
  email: string;
  roles: UserRole[];
}

type Output = Either<UserAlreadyExistsError, { user: CreateUserOutput }>

@Injectable()
export class CreateAccountUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cryptography: Cryptography,
  ) {}

  async execute({
    name,
    socialName,
    cpf,
    email,
    password,
    birthDate,
    phone,
  }: CreateUserInput): Promise<Output> {
    const userWithSameEmail = await this.usersRepository.findByEmail(email);

    if (userWithSameEmail) {
      return left(new UserAlreadyExistsError(email));
    }

    const userWithSameCpf = await this.usersRepository.findByCpf(cpf);

    if (userWithSameCpf) {
      return left(new UserAlreadyExistsError(cpf));
    }

    const hashedPassword = await this.cryptography.hash(password);

    const user = User.create({
      name,
      email,
      password: hashedPassword,
      cpf,
      socialName,
      birthDate,
      phone,
    });

    await this.usersRepository.save(user);

    return right({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
  }
}
