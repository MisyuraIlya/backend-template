import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AgentObjective } from './entities/agent-objective.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { AgentObjectiveType } from './enums/AgentObjectiveType';

@Injectable()
export class AgentObjectiveService extends TypeOrmCrudService<AgentObjective> {
  constructor(
    @InjectRepository(AgentObjective)
    repo,
  ) {
    super(repo);
  }

  async findAll(
    page: number,
    limit: number,
    objectiveType?: AgentObjectiveType,
    agentId?: number,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (objectiveType) {
      where.objectiveType = objectiveType;
    }
    if (agentId) {
      where.agent = { id: agentId };
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['agent', 'client'],
      skip,
      take: limit,
      order: { date: 'DESC' },
    });

    return { data, total, page, limit };
  }

  
}
