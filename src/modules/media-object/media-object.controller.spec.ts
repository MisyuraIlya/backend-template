import { Test, TestingModule } from '@nestjs/testing';
import { MediaObjectController } from './media-object.controller';
import { MediaObjectService } from './media-object.service';

describe('MediaObjectController', () => {
  let controller: MediaObjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaObjectController],
      providers: [MediaObjectService],
    }).compile();

    controller = module.get<MediaObjectController>(MediaObjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
