import { PartialType } from '@nestjs/mapped-types';
import { CreateAgentTargetDto } from './create-agent-target.dto';

export class UpdateAgentTargetDto extends PartialType(CreateAgentTargetDto) {}
