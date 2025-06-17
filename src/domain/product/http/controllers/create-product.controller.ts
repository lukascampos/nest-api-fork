import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CreateProductUseCase } from "../../core/use-cases/create-product.use-case";
import { RolesGuard } from "@/domain/_shared/auth/roles/roles.guard";
import { Roles } from "@/domain/_shared/auth/decorators/roles.decorator";
import { UserRole } from "@/domain/identity/core/entities/user.entity";
import { Product } from "../../core/entities/product.entity";
import { CreateProductDto } from "../dtos/create-product-.dto";
import { CurrentUser } from "@/domain/_shared/auth/decorators/current-user.decorator";
import { UserPayload } from "@/domain/_shared/auth/jwt/jwt.strategy";

@Controller('products')
@UseGuards(RolesGuard)
export class CreateProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
  ) {}

  @Post()
  @Roles(UserRole.ARTISAN)
  async handle(
    @CurrentUser() artisan: UserPayload,
    @Body() body: CreateProductDto
  ) {
    const result = await this.createProductUseCase.execute({...body, artisanId: artisan.sub});
    
    if (result.isLeft()) {
      throw new Error(result.value.message);
    }

    return result.value;
  }
}