import { Test, TestingModule } from '@nestjs/testing';
import { PriceListDetailedController } from './price-list-detailed.controller';
import { PriceListDetailedService } from './price-list-detailed.service';

describe('PriceListDetailedController', () => {
  let controller: PriceListDetailedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceListDetailedController],
      providers: [PriceListDetailedService],
    }).compile();

    controller = module.get<PriceListDetailedController>(PriceListDetailedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
