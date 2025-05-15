import { Test, TestingModule } from '@nestjs/testing';
import { AttributeMainController } from './attribute-main.controller';
import { AttributeMainService } from './attribute-main.service';

describe('AttributeMainController', () => {
  let controller: AttributeMainController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttributeMainController],
      providers: [AttributeMainService],
    }).compile();

    controller = module.get<AttributeMainController>(AttributeMainController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
