import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AgentTargetService } from './agent-target.service';
import { CreateAgentTargetDto } from './dto/create-agent-target.dto';
import { UpdateAgentTargetDto } from './dto/update-agent-target.dto';
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

}
