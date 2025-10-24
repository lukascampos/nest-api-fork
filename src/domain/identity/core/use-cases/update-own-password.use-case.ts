import { Injectable, Logger } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { SamePasswordError } from '../errors/same-password.error';
import { InvalidPasswordError } from '../errors/invalid-password.error';

export interface UpdateOwnPasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface UpdateOwnPasswordOutput {
  message: string;
}

type Output = Either<
  UserNotFoundError | InvalidPasswordError | SamePasswordError,
  UpdateOwnPasswordOutput
>;

@Injectable()
export class UpdateOwnPasswordUseCase {
  private readonly logger = new Logger(UpdateOwnPasswordUseCase.name);

  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
    currentPassword,
    newPassword,
  }: UpdateOwnPasswordInput): Promise<Output> {
    this.logger.log('Starting password update', { userId });

    try {
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        this.logger.warn('User not found', { userId });
        return left(new UserNotFoundError(userId, 'id'));
      }

      const isPasswordValid = await compare(
        currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        this.logger.warn('Invalid current password', { userId });
        return left(new InvalidPasswordError());
      }

      const isSamePassword = await compare(
        newPassword,
        user.password,
      );

      if (isSamePassword) {
        this.logger.warn('New password is the same as current', { userId });
        return left(new SamePasswordError());
      }

      const hashedPassword = await hash(newPassword, 12);

      await this.usersRepository.updatePassword(userId, hashedPassword);

      this.logger.log('Password updated successfully', { userId });

      return right({
        message: 'Password updated successfully',
      });
    } catch (error) {
      this.logger.error('Error updating password', error.stack);
      throw error;
    }
  }
}
