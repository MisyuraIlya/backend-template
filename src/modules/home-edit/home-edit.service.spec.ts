import { Test, TestingModule } from '@nestjs/testing';
import { HomeEditService } from './home-edit.service';

describe('HomeEditService', () => {
  let service: HomeEditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomeEditService],
    }).compile();

    service = module.get<HomeEditService>(HomeEditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
