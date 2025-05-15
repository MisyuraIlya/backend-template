import { Test, TestingModule } from '@nestjs/testing';
import { PriceListUserController } from './price-list-user.controller';
import { PriceListUserService } from './price-list-user.service';

describe('PriceListUserController', () => {
  let controller: PriceListUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceListUserController],
      providers: [PriceListUserService],
    }).compile();

    controller = module.get<PriceListUserController>(PriceListUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
