import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { AttributeSub } from './entities/attribute-sub.entity';

@Injectable()
export class AttributeSubService extends TypeOrmCrudService<AttributeSub> {
  constructor(
    @InjectRepository(AttributeSub)
    repo,
  ) {
    super(repo);
  }

  async dragAndDrop(items: AttributeSub[]): Promise<AttributeSub[]> {
    const toSave = items.map(i => ({ id: i.id, orden: i.orden }));
    await this.repo.save(toSave);
    return this.repo.find({ order: { orden: 'ASC' } });
  }
}
