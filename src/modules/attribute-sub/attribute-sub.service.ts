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
}
