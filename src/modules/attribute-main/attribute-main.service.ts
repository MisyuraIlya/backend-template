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
}
