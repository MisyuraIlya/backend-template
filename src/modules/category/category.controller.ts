import { Controller, Get, Post, Body, Param, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Crud, CrudController } from '@dataui/crud';
import { Category } from './entities/category.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Crud({
  model: { type: Category },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
      mediaObject: {
        eager: true,
      },
    },
  },
})

@UseInterceptors(CacheInterceptor)
@Controller('category')
export class CategoryController implements CrudController<Category> {
  constructor(public readonly service: CategoryService) {}

  @Get('categoriesApp')
  getCategoriesApp() {
    return this.service.getCategoriesApp();
  }

  @Get('adminCategories/:categoryLvl1/:categoryLvl2')
  adminCategory(
    @Param('categoryLvl1', ParseIntPipe) categoryLvl1: number,
    @Param('categoryLvl2', ParseIntPipe) categoryLvl2: number,
  ) {
    return this.service.getAdminCategory(categoryLvl1, categoryLvl2);
  }

  @Post('drag-and-drop')
  async reorder(@Body() dto: Category[]) {
    return this.service.reorderCategories(dto);
  }

}
