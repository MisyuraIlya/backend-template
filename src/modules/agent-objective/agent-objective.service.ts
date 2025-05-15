import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AgentObjective } from './entities/agent-objective.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';

@Injectable()
export class AgentObjectiveService extends TypeOrmCrudService<AgentObjective> {
  constructor(
    @InjectRepository(AgentObjective)
    repo,
  ) {
    super(repo);
  }
}
