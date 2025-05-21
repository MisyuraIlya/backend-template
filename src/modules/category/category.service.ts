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
    return this.repo
      .createQueryBuilder('cat')
      .where('cat.lvlNumber = :lvl', { lvl: 1 })
      .leftJoinAndSelect('cat.categories', 'lvl2')
      .leftJoinAndSelect('lvl2.categories', 'lvl3')
      .leftJoinAndSelect('cat.mediaObject', 'media')
      .orderBy('cat.orden', 'ASC')
      .addOrderBy('lvl2.orden', 'ASC')
      .addOrderBy('lvl3.orden', 'ASC')
      .getMany();
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
      relations: ['parent', 'categories','mediaObject'],    
      order: { orden: 'ASC' },
    });
  }

  async reorderCategories(
    items: Category[],
  ): Promise<Category[]> {
    const toSave = items.map(({ id, orden }) => ({ id, orden }));
    await this.repo.save(toSave);
    return this.repo.find({
      order: { orden: 'ASC' },
      relations: ['parent', 'categories', 'mediaObject'],
    });
  }
}
