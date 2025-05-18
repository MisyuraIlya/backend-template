import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { Crud, CrudController } from '@dataui/crud';
import { AgentObjective } from './entities/agent-objective.entity';
import { AgentObjectiveService } from './agent-objective.service';
import { AgentObjectiveType } from './enums/AgentObjectiveType';

@Crud({
  model: { type: AgentObjective },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
      agent: {
        eager: true,    
      },
      client: {
        eager: false,   
      },
    },
    alwaysPaginate: true,
  },
})
@Controller('agent-objective')
export class AgentObjectiveController
  implements CrudController<AgentObjective>
{
  constructor(public readonly service: AgentObjectiveService) {}

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('objectiveType') rawType?: string,
    @Query('agent', ParseIntPipe) agentId?: number,
  ) {
    const objectiveType = rawType
      ? (rawType as AgentObjectiveType)
      : undefined;
    return this.service.findAll(page, limit, objectiveType, agentId);
  }
}
