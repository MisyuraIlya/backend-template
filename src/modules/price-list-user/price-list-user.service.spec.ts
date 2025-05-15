import { Test, TestingModule } from '@nestjs/testing';
import { PriceListUserService } from './price-list-user.service';

describe('PriceListUserService', () => {
  let service: PriceListUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceListUserService],
    }).compile();

    service = module.get<PriceListUserService>(PriceListUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
