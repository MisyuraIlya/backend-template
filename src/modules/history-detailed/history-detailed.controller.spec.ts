import { Test, TestingModule } from '@nestjs/testing';
import { HistoryDetailedController } from './history-detailed.controller';
import { HistoryDetailedService } from './history-detailed.service';

describe('HistoryDetailedController', () => {
  let controller: HistoryDetailedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoryDetailedController],
      providers: [HistoryDetailedService],
    }).compile();

    controller = module.get<HistoryDetailedController>(HistoryDetailedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
