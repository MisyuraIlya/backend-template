import { Test, TestingModule } from '@nestjs/testing';
import { HomeMediaController } from './home-media.controller';
import { HomeMediaService } from './home-media.service';

describe('HomeMediaController', () => {
  let controller: HomeMediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeMediaController],
      providers: [HomeMediaService],
    }).compile();

    controller = module.get<HomeMediaController>(HomeMediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
