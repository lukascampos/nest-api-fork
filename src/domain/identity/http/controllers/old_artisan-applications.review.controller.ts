// import {
//   Controller, Patch, Param, Body,
//   UseGuards, ConflictException, NotFoundException, BadRequestException,
// } from '@nestjs/common';
// import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
// import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
// import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
// import { ReviewDisableArtisanUseCase } from '../../core/use-cases/old_review-disable-artisan.use-case';
// import { ReviewDisableArtisanDto } from '../dtos/disable-artisan.dto';
// import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
// import { UserRole } from '../../core/entities/user.entity';
// import { SingleUuidParamDto } from '../dtos/single-uuid-param.dto';
// import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
// import { ApplicationNotFoundError } from '../../core/errors/application-not-found.error';
// import { ApplicationAlreadyModeratedError } from '../../core/errors/application-already-moderated.error';
// import { MissingPropertyError } from '../../core/errors/missing-property.error';

// @Controller('artisan-applications')
// export class ReviewArtisanController {
//   constructor(
//     private readonly reviewUseCase: ReviewDisableArtisanUseCase,
//   ) {}

//   @Patch(':id/review')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(UserRole.MODERATOR, UserRole.ADMIN)
//   async review(
//     @Param(){ id }: SingleUuidParamDto,
//     @Body() dto: ReviewDisableArtisanDto,
//     @CurrentUser() user: TokenPayload,
//   ) {
//     const result = await this.reviewUseCase.execute({
//       applicationId: id,
//       reviewerId: user.sub,
//       status: dto.status,
//       rejectionReason: dto.rejectionReason,
//     });
//     if (result.isLeft()) {
//       const error = result.value;
//       if (error instanceof ApplicationNotFoundError) {
//         throw new NotFoundException(error.message);
//       }
//       if (error instanceof ApplicationAlreadyModeratedError) {
//         throw new ConflictException(error.message);
//       }
//       if (error instanceof MissingPropertyError) {
//         throw new BadRequestException(error.message);
//       }
//       throw new BadRequestException(error.message);
//     }
//     return { message: 'Disable request reviewed successfully' };
//   }
// }
