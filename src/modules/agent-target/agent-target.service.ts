import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { AgentTarget } from './entities/agent-target.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AgentTargetService extends TypeOrmCrudService<AgentTarget> {
  constructor(
    @InjectRepository(AgentTarget)
    repo,
  ) {
    super(repo);
  }
}
