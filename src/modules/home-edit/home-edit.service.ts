import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HomeEdit } from './entities/home-edit.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';

@Injectable()
export class HomeEditService extends TypeOrmCrudService<HomeEdit> {
  constructor(
    @InjectRepository(HomeEdit)
    repo,
  ) {
    super(repo);
  }

  async updateOrder(items: HomeEdit[]): Promise<HomeEdit[]> {
    for (const { id, orden } of items) {
      await this.repo.update(id, { orden });
    }
    return this.repo.find({ order: { orden: 'ASC' } });
  }

}
