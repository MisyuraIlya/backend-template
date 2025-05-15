import { Test, TestingModule } from '@nestjs/testing';
import { AttributeSubController } from './attribute-sub.controller';
import { AttributeSubService } from './attribute-sub.service';

describe('AttributeSubController', () => {
  let controller: AttributeSubController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttributeSubController],
      providers: [AttributeSubService],
    }).compile();

    controller = module.get<AttributeSubController>(AttributeSubController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
