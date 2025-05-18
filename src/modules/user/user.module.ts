import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ErpManager } from 'src/erp/erp.manager';
import { AgentObjective } from '../agent-objective/entities/agent-objective.entity';
import { AgentTarget } from '../agent-target/entities/agent-target.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,AgentObjective,AgentTarget]),
  ],
  controllers: [UserController],
  providers: [UserService, ErpManager],
})
export class UserModule {}
