import { Test, TestingModule } from '@nestjs/testing';
import { BonusDetailedController } from './bonus-detailed.controller';
import { BonusDetailedService } from './bonus-detailed.service';

describe('BonusDetailedController', () => {
  let controller: BonusDetailedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BonusDetailedController],
      providers: [BonusDetailedService],
    }).compile();

    controller = module.get<BonusDetailedController>(BonusDetailedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
