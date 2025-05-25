import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { History } from '../history/entities/history.entity';
import { NotificationUser } from '../notification-user/entities/notification-user.entity';
import { User } from '../user/entities/user.entity';
import { PushSubscriptionModule } from '../push-subscription/push-subscription.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification,NotificationUser,History, User]),
    PushSubscriptionModule
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
