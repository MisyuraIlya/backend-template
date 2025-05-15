import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { HistoryDetailed } from './entities/history-detailed.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class HistoryDetailedService extends TypeOrmCrudService<HistoryDetailed> {
  constructor(
    @InjectRepository(HistoryDetailed)
    repo,
  ) {
    super(repo);
  }
}
