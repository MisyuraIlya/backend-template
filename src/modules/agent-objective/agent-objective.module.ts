import { Module } from '@nestjs/common';
import { AgentObjectiveService } from './agent-objective.service';
import { AgentObjectiveController } from './agent-objective.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentObjective } from './entities/agent-objective.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentObjective]),
  ],
  controllers: [AgentObjectiveController],
  providers: [AgentObjectiveService],
})
export class AgentObjectiveModule {}
