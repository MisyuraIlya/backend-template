import { Test, TestingModule } from '@nestjs/testing';
import { AttributeSubService } from './attribute-sub.service';

describe('AttributeSubService', () => {
  let service: AttributeSubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttributeSubService],
    }).compile();

    service = module.get<AttributeSubService>(AttributeSubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
