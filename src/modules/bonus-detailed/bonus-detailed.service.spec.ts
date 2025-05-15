import { Test, TestingModule } from '@nestjs/testing';
import { BonusDetailedService } from './bonus-detailed.service';

describe('BonusDetailedService', () => {
  let service: BonusDetailedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BonusDetailedService],
    }).compile();

    service = module.get<BonusDetailedService>(BonusDetailedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
