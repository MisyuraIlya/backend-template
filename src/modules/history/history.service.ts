import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { History } from './entities/history.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';

@Injectable()
export class HistoryService extends TypeOrmCrudService<History>  {
  constructor(
    @InjectRepository(History)
    repo,
  ) {
    super(repo);
  }
}
