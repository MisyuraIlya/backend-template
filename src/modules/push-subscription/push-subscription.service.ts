import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { PushSubscription } from './entities/push-subscription.entity';

@Injectable()
export class PushSubscriptionService {
    constructor(
    @InjectRepository(PushSubscription)
    private readonly subRepo: Repository<PushSubscription>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    ) {}

    async saveSubscription(
    userId: number,
    { endpoint, keys: { p256dh, auth } }: any,
    ) {
    const user = await this.userRepo.findOneByOrFail({ id: userId });
    await this.subRepo.delete({ endpoint, user });
    const sub = this.subRepo.create({ endpoint, p256dh, auth, user });
    return this.subRepo.save(sub);
    }

    async removeSubscription(userId: number, endpoint: string) {
    return this.subRepo.delete({ endpoint, user: { id: userId } });
    }

    async getSubscriptionsForUser(userId: number) {
    return this.subRepo.find({ where: { user: { id: userId } } });
    }
}
