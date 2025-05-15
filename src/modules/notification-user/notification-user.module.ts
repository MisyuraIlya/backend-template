import { Module } from '@nestjs/common';
import { NotificationUserService } from './notification-user.service';
import { NotificationUserController } from './notification-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationUser } from './entities/notification-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationUser]),
  ],
  controllers: [NotificationUserController],
  providers: [NotificationUserService],
})
export class NotificationUserModule {}
