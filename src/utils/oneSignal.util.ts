import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { UsersTypes } from 'src/modules/user/enums/UsersTypes';

@Injectable()
export class OneSignalService {
  private readonly appId: string;
  private readonly apiKey: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.appId = process.env.ONE_SIGNAL_APP_ID!;
    this.apiKey = process.env.ONE_SIGNAL_KEY!;
  }

  async sendPushAllUsers(title: string, description: string, imgLink: string) {
    const users = await this.userRepository.find();

    // filter out nulls, then map to string[]
    const appIds: string[] = users
      .filter(user => user.oneSignalAppId != null)
      .map(user => user.oneSignalAppId!);

    const payload = this.prepareObject(title, description, appIds, imgLink);
    return this.sendOneSignal(payload);
  }

  async sendOrderPush(user: User, title: string, description: string) {
    if (user.oneSignalAppId) {
      const payload = this.prepareObject(title, description, [user.oneSignalAppId], '');
      await this.sendOneSignal(payload);
    }
  }

  async alertToAgentsGetOrder(title: string, description: string) {
    const users = await this.userRepository.find();

    // only include agents/admins with a valid appId
    const appIds: string[] = users
      .filter(user =>
        user.oneSignalAppId != null &&
        [UsersTypes.AGENT, UsersTypes.SUPER_AGENT, UsersTypes.ADMIN].includes(user.role)
      )
      .map(user => user.oneSignalAppId!);

    const payload = this.prepareObject(title, description, appIds, '');
    await this.sendOneSignal(payload);
  }

  async sendAllAgents(title: string, description: string, imgLink: string) {
    const users = await this.userRepository.find();

    const appIds: string[] = users
      .filter(user =>
        user.oneSignalAppId != null &&
        [UsersTypes.AGENT, UsersTypes.SUPER_AGENT].includes(user.role)
      )
      .map(user => user.oneSignalAppId!);

    const payload = this.prepareObject(title, description, appIds, imgLink);
    return this.sendOneSignal(payload);
  }

  private prepareObject(
    title: string,
    description: string,
    appIds: string[],
    img: string,
  ) {
    return {
      app_id: this.appId,
      include_player_ids: appIds,
      headings: { en: title },
      contents: { en: description },
      chrome_web_image: img || null,
    };
  }

  private async sendOneSignal(payload: any) {
    try {
      const response = await axios.post(
        'https://onesignal.com/api/v1/notifications',
        payload,
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Basic ${this.apiKey}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error sending notification to OneSignal', error);
      return 'error';
    }
  }
}
