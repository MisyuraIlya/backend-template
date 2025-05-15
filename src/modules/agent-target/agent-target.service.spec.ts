import { Test, TestingModule } from '@nestjs/testing';
import { AgentTargetService } from './agent-target.service';

describe('AgentTargetService', () => {
  let service: AgentTargetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentTargetService],
    }).compile();

    service = module.get<AgentTargetService>(AgentTargetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
