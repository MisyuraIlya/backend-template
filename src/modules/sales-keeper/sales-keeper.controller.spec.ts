import { Test, TestingModule } from '@nestjs/testing';
import { SalesKeeperController } from './sales-keeper.controller';
import { SalesKeeperService } from './sales-keeper.service';

describe('SalesKeeperController', () => {
  let controller: SalesKeeperController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesKeeperController],
      providers: [SalesKeeperService],
    }).compile();

    controller = module.get<SalesKeeperController>(SalesKeeperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
