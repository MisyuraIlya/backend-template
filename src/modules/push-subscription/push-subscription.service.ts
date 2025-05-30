import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webPush from 'web-push';
import { PushSubscription } from './entities/push-subscription.entity';

@Injectable()
export class PushSubscriptionService {
  private readonly logger = new Logger(PushSubscriptionService.name);

  constructor(
    @InjectRepository(PushSubscription)
    private readonly subRepo: Repository<PushSubscription>,
  ) {
    webPush.setVapidDetails(
      process.env.VAPID_ADMIN_EMAIL,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );
  }

  async saveSubscription(
    userId: number,
    { endpoint, keys: { p256dh, auth } }: any,
  ) {
    await this.subRepo.delete({ endpoint, user: { id: userId } });
    const sub = this.subRepo.create({
      endpoint,
      p256dh,
      auth,
      user: { id: userId } as any,
    });
    return this.subRepo.save(sub);
  }

  async removeSubscription(userId: number, endpoint: string) {
    return this.subRepo.delete({ endpoint, user: { id: userId } as any });
  }

  async getSubscriptionsForUser(userId: number) {
    return this.subRepo.find({
      where: { user: { id: userId } },
    });
  }

  async sendNotification(
    userId: number,
    payload: Record<string, any>,
  ): Promise<void> {
    const subs = await this.getSubscriptionsForUser(userId);
    const strPayload = JSON.stringify(payload);

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            strPayload,
          );
        } catch (err: any) {
          this.logger.warn(
            `Push failed for ${sub.endpoint}: ${err.statusCode || err.message}`,
          );
          if (err.statusCode === 404 || err.statusCode === 410) {
            this.logger.log(`Removed stale subscription #${sub.id}`);
          }
        }
      }),
    );
  }
}
