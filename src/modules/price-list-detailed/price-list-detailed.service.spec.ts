import { Test, TestingModule } from '@nestjs/testing';
import { PriceListDetailedService } from './price-list-detailed.service';

describe('PriceListDetailedService', () => {
  let service: PriceListDetailedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceListDetailedService],
    }).compile();

    service = module.get<PriceListDetailedService>(PriceListDetailedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
