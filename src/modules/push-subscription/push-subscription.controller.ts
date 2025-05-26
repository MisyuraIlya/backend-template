import { Body, Controller, Post } from '@nestjs/common';
import { PushSubscriptionService } from './push-subscription.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('push-subscription')
export class PushSubscriptionController {
  constructor(
    private readonly pushSubService: PushSubscriptionService,
  ) {}

  @Post('subscribe')
  async subscribe(
    @Body() sub: { endpoint: string; keys: { p256dh: string; auth: string } },
    @CurrentUser() user: User,
  ) {
    await this.pushSubService.saveSubscription(user.id, sub);
    return { success: true };
  }

  @Post('unsubscribe')
  async unsubscribe(
    @Body('endpoint') endpoint: string,
    @CurrentUser() user: User,
  ) {
    await this.pushSubService.removeSubscription(user.id, endpoint);
    return { success: true };
  }

  @Post('notify')
  async notify(
    @Body('title') title: string,
    @Body('message') message: string,
    @CurrentUser() user: User,
  ) {
    await this.pushSubService.sendNotification(user.id, {
      title,
      message,
      timestamp: Date.now(),
    });
    return { success: true };
  }
}
