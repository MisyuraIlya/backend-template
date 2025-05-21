import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AttributeMain } from './entities/attribute-main.entity';

@Injectable()
export class AttributeMainService extends TypeOrmCrudService<AttributeMain> {
  constructor(
    @InjectRepository(AttributeMain)
    repo,
  ) {
    super(repo);
  }

  async updateOrder(
    items: { id: number; orden: number }[],
  ): Promise<AttributeMain[]> {
    // create partial entities for upsert
    const toSave = items.map(i =>
      this.repo.create({ id: i.id, orden: i.orden }),
    );
    await this.repo.save(toSave);

    // return fresh list, ordered by orden ASC
    return this.repo.find({ order: { orden: 'ASC' } });
  }
}
