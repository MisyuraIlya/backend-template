import { Test, TestingModule } from '@nestjs/testing';
import { HistoryDetailedService } from './history-detailed.service';

describe('HistoryDetailedService', () => {
  let service: HistoryDetailedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoryDetailedService],
    }).compile();

    service = module.get<HistoryDetailedService>(HistoryDetailedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
