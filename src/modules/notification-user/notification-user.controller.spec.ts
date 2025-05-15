import { Test, TestingModule } from '@nestjs/testing';
import { NotificationUserController } from './notification-user.controller';
import { NotificationUserService } from './notification-user.service';

describe('NotificationUserController', () => {
  let controller: NotificationUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationUserController],
      providers: [NotificationUserService],
    }).compile();

    controller = module.get<NotificationUserController>(NotificationUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
