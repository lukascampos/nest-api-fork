import { Controller, Get } from '@nestjs/common';
import { ListRawMaterialsUseCase } from '@/domain/catalog/use-cases/list-raw-materials.use-case';
import { ListTechniquesUseCase } from '@/domain/catalog/use-cases/list-techniques.use-case';
import { ListProductCategoriesUseCase } from '@/domain/catalog/use-cases/list-product-categories.use-case';
import { Public } from '@/domain/_shared/auth/decorators/public.decorator';

@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly listRawMaterials: ListRawMaterialsUseCase,
    private readonly listTechniques: ListTechniquesUseCase,
    private readonly listCategories: ListProductCategoriesUseCase,
  ) {}

  @Public()
  @Get('materials')
  async materials() {
    return { items: await this.listRawMaterials.execute() };
  }

  @Public()
  @Get('techniques')
  async techniques() {
    return { items: await this.listTechniques.execute() };
  }

  @Public()
  @Get('categories')
  async categories() {
    return { items: await this.listCategories.execute() };
  }
}
