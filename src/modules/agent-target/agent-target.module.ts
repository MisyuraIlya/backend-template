import { Module } from '@nestjs/common';
import { AgentTargetService } from './agent-target.service';
import { AgentTargetController } from './agent-target.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentTarget } from './entities/agent-target.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentTarget]),
  ],
  controllers: [AgentTargetController],
  providers: [AgentTargetService],
})
export class AgentTargetModule {}
