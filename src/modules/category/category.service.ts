import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoryService extends TypeOrmCrudService<Category>  {
  constructor(
    @InjectRepository(Category)
    repo,
  ) {
    super(repo);
  }

  async getCategoriesApp(): Promise<Category[]> {
    return this.repo.find({
      where: { lvlNumber: 1 },
      relations: [
        'categories',              
        'categories.categories',  
      ],
    });
  }
}
