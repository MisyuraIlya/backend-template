import { Test, TestingModule } from '@nestjs/testing';
import { HomeMediaService } from './home-media.service';

describe('HomeMediaService', () => {
  let service: HomeMediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomeMediaService],
    }).compile();

    service = module.get<HomeMediaService>(HomeMediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
