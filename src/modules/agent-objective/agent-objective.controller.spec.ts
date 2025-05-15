import { Test, TestingModule } from '@nestjs/testing';
import { AgentObjectiveController } from './agent-objective.controller';
import { AgentObjectiveService } from './agent-objective.service';

describe('AgentObjectiveController', () => {
  let controller: AgentObjectiveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentObjectiveController],
      providers: [AgentObjectiveService],
    }).compile();

    controller = module.get<AgentObjectiveController>(AgentObjectiveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
