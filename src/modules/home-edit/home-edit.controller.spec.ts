import { Test, TestingModule } from '@nestjs/testing';
import { HomeEditController } from './home-edit.controller';
import { HomeEditService } from './home-edit.service';

describe('HomeEditController', () => {
  let controller: HomeEditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeEditController],
      providers: [HomeEditService],
    }).compile();

    controller = module.get<HomeEditController>(HomeEditController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
