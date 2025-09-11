// import {
//   Controller, UseGuards, Patch, Param,
//   BadRequestException,
//   NotFoundException,
// } from '@nestjs/common';
// import { Roles } from '@prisma/client';
// import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
// import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
// import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
// import { DeactivateUserUseCase } from '../../core/use-cases/old_deactivate-user.use-case';
// import { DeactivateUserDto } from '../dtos/deactivate-user.dto';
// import { UserNotFoundError } from '../../core/errors/user-not-found.error';
// import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';

// @Controller('users/:userId/deactivate')
// @UseGuards(JwtAuthGuard, RolesGuard)
// export class DeactivateUserController {
//   constructor(private readonly deactivateUserUseCase: DeactivateUserUseCase) {}

//   @Patch()
//   async handle(
//     @Param() param: DeactivateUserDto,
//     @CurrentUser() userPayload: TokenPayload,
//   ) {
//     if (userPayload.roles.includes(Roles.ADMIN)) {
//       const result = await this.deactivateUserUseCase.execute({ userId: param.userId });

//       if (result.isLeft()) {
//         const error = result.value;

//         switch (error.constructor) {
//           case UserNotFoundError:
//             throw new NotFoundException(error.message);
//           default:
//             throw new BadRequestException(error.message);
//         }
//       }

//       return result.value;
//     }

//     if (userPayload.sub === param.userId) {
//       const result = await this.deactivateUserUseCase.execute({ userId: param.userId });

//       if (result.isLeft()) {
//         const error = result.value;

//         switch (error.constructor) {
//           case UserNotFoundError:
//             throw new NotFoundException(error.message);
//           default:
//             throw new BadRequestException(error.message);
//         }
//       }

//       return result.value;
//     }

//     return new BadRequestException();
//   }
// }
