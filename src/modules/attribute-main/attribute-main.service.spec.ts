import { Test, TestingModule } from '@nestjs/testing';
import { AttributeMainService } from './attribute-main.service';

describe('AttributeMainService', () => {
  let service: AttributeMainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttributeMainService],
    }).compile();

    service = module.get<AttributeMainService>(AttributeMainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
