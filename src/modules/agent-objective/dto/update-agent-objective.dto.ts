import { PartialType } from '@nestjs/mapped-types';
import { CreateAgentObjectiveDto } from './create-agent-objective.dto';

export class UpdateAgentObjectiveDto extends PartialType(CreateAgentObjectiveDto) {}
