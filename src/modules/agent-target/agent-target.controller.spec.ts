import { Test, TestingModule } from '@nestjs/testing';
import { AgentTargetController } from './agent-target.controller';
import { AgentTargetService } from './agent-target.service';

describe('AgentTargetController', () => {
  let controller: AgentTargetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentTargetController],
      providers: [AgentTargetService],
    }).compile();

    controller = module.get<AgentTargetController>(AgentTargetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
