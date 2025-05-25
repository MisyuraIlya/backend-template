import { Body, Controller, Post, Req } from '@nestjs/common';
import { PushSubscriptionService } from './push-subscription.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('push-subscription')
export class PushSubscriptionController {
  constructor(private readonly pushSubscriptionService: PushSubscriptionService) {}


  @Post('subscribe')
  async subscribe(
    @Body() sub: { endpoint: string; keys: { p256dh: string; auth: string } },
    @CurrentUser() user: User,
  ) {
    await this.pushSubscriptionService.saveSubscription(user.id, sub);
    return { success: true };
  }

  @Post('unsubscribe')
  async unsubscribe(
    @Body('endpoint') endpoint: string,
    @CurrentUser() user: User,
  ) {
    await this.pushSubscriptionService.removeSubscription(user.id, endpoint);
    return { success: true };
  }

}
