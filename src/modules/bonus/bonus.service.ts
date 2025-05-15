import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Bonus } from './entities/bonus.entity';

@Injectable()
export class BonusService extends TypeOrmCrudService<Bonus>{
  constructor(
    @InjectRepository(Bonus)
    repo,
  ) {
    super(repo);
  }
}
