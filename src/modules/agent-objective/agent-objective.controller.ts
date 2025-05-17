import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@dataui/crud';
import { AgentObjective } from './entities/agent-objective.entity';
import { AgentObjectiveService } from './agent-objective.service';

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
}
