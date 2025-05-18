import { Controller, Get, Query } from '@nestjs/common';
import { AgentTargetService } from './agent-target.service';
import { Crud, CrudController } from '@dataui/crud';
import { AgentTarget } from './entities/agent-target.entity';

@Crud({
  model: { type: AgentTarget },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
})
@Controller('agent-target')
export class AgentTargetController implements CrudController<AgentTarget>{
  constructor(public readonly service: AgentTargetService) {}

  @Get()
  async getByAgentAndYear(
    @Query('agent') agent: number,
    @Query('year') year: string,
  ) {
    if (agent && year) {
      return this.service.findByAgentAndYear(agent, year);
    }
  }
}
