import { Controller } from '@nestjs/common';
import { AgentObjectiveService } from './agent-objective.service';
import { Crud, CrudController } from '@dataui/crud';
import { AgentObjective } from './entities/agent-objective.entity';

@Crud({
  model: { type: AgentObjective },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
})
@Controller('agent-objective')
export class AgentObjectiveController implements CrudController<AgentObjective> {
  constructor(public readonly service: AgentObjectiveService) {}

}
