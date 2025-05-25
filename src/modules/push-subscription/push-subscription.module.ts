import { Module } from '@nestjs/common';
import { PushSubscriptionService } from './push-subscription.service';
import { PushSubscriptionController } from './push-subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { PushSubscription } from './entities/push-subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PushSubscription, User])],
  controllers: [PushSubscriptionController],
  providers: [PushSubscriptionService],
  exports: [PushSubscriptionService],
})
export class PushSubscriptionModule {}
