import { Test, TestingModule } from '@nestjs/testing';
import { NotificationUserService } from './notification-user.service';

describe('NotificationUserService', () => {
  let service: NotificationUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationUserService],
    }).compile();

    service = module.get<NotificationUserService>(NotificationUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
