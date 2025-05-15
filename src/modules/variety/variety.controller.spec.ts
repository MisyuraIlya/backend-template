import { Test, TestingModule } from '@nestjs/testing';
import { VarietyController } from './variety.controller';
import { VarietyService } from './variety.service';

describe('VarietyController', () => {
  let controller: VarietyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VarietyController],
      providers: [VarietyService],
    }).compile();

    controller = module.get<VarietyController>(VarietyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
