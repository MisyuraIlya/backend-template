import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getAdminCategory(
    lvl1Id: number,
    lvl2Id: number,
  ): Promise<Category[]> {
    if (lvl1Id === 0 && lvl2Id === 0) {
      return this.getCategoriesApp();
    }
    const lookupParentId = lvl2Id > 0 ? lvl2Id : lvl1Id;
    return this.repo.find({
      where: { parent: { id: lookupParentId } },
      relations: ['parent', 'categories'],    
      order: { orden: 'ASC' },
    });
  }
}
