import {
  Controller, Post, UsePipes, Body,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { IController } from 'src/core/interfaces/IController';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';
import { z } from 'zod';
import { CreateUserService } from './create-user.service';

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>;

@Controller('/users')
@UsePipes(new ZodValidationPipe(createAccountBodySchema))
export class CreateUserController implements IController<CreateAccountBodySchema, unknown> {
  constructor(
    private readonly createUserService: CreateUserService,
  ) {}

  @Post()
  async handle(@Body() body: CreateAccountBodySchema) {
    const { message, error } = await this.createUserService.execute(body);

    if (error) {
      switch (error.error) {
        case 'Conflict':
          throw new ConflictException(error.message);
        default:
          throw new InternalServerErrorException();
      }
    }

    return { message };
  }
}
