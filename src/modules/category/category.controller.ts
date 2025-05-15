import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Crud, CrudController } from '@dataui/crud';
import { Category } from './entities/category.entity';

@Crud({
  model: { type: Category },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
})
@Controller('category')
export class CategoryController implements CrudController<Category> {
  constructor(public readonly service: CategoryService) {}

}
