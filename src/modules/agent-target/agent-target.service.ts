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

  async findByAgentAndYear(agentId: number, year: string): Promise<AgentTarget[]> {
    return this.repo.find({
      where: {
        agent: { id: agentId },
        year,
      },
    });
  }
}
