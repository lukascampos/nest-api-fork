// import {
//   Controller, Post, Param,
//   UseGuards, ConflictException, NotFoundException, BadRequestException,
//   HttpCode,
// } from '@nestjs/common';
// import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
// import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
// import { ConfirmDisableArtisanUseCase } from '../../core/use-cases/old_confirm-disable-artisan.use-case';
// import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
// import { UserRole } from '../../core/entities/user.entity';
// import { ArtisanApplicationNotApprovedError } from '../../core/errors/artisan-application-not-approved.error';
// import { SingleUuidParamDto } from '../dtos/single-uuid-param.dto';
// import { ApplicationNotFoundError } from '../../core/errors/application-not-found.error';

// @Controller('artisan-applications')

// export class ConfirmDisableArtisanController {
//   constructor(
//     private readonly confirmUseCase: ConfirmDisableArtisanUseCase,
//   ) {}

//   @Post(':id/confirm')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(UserRole.MODERATOR, UserRole.ADMIN)
//   @HttpCode(200)
//   async confirm(
//     @Param(){ id }:SingleUuidParamDto,
//   ): Promise<{ message: string }> {
//     const result = await this.confirmUseCase.execute(id);
//     if (result.isLeft()) {
//       const err = result.value as | ApplicationNotFoundError
//   | ArtisanApplicationNotApprovedError
//   | Error;
//       if (err instanceof ApplicationNotFoundError) {
//         throw new NotFoundException(err.message);
//       }
//       if (err instanceof ArtisanApplicationNotApprovedError) {
//         throw new ConflictException(err.message);
//       }
//       throw new BadRequestException(err.message);
//     }
//     return { message: 'Artisan profile disabled successfully' };
//   }
// }
