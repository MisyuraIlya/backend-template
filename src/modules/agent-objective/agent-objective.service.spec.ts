import { Test, TestingModule } from '@nestjs/testing';
import { AgentObjectiveService } from './agent-objective.service';

describe('AgentObjectiveService', () => {
  let service: AgentObjectiveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentObjectiveService],
    }).compile();

    service = module.get<AgentObjectiveService>(AgentObjectiveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
