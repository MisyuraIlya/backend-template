import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { BonusDetailed } from './entities/bonus-detailed.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BonusDetailedService extends TypeOrmCrudService<BonusDetailed> {
  constructor(
    @InjectRepository(BonusDetailed)
    repo,
  ) {
    super(repo);
  }
}
