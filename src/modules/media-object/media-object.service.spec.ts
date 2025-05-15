import { Test, TestingModule } from '@nestjs/testing';
import { MediaObjectService } from './media-object.service';

describe('MediaObjectService', () => {
  let service: MediaObjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaObjectService],
    }).compile();

    service = module.get<MediaObjectService>(MediaObjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
