import { Test, TestingModule } from '@nestjs/testing';
import { SalesKeeperService } from './sales-keeper.service';

describe('SalesKeeperService', () => {
  let service: SalesKeeperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesKeeperService],
    }).compile();

    service = module.get<SalesKeeperService>(SalesKeeperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
