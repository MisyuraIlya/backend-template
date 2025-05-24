import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/modules/user/entities/user.entity';
import { HomeEdit } from 'src/modules/home-edit/entities/home-edit.entity';
import { UsersTypes } from 'src/modules/user/enums/UsersTypes';

@Injectable()
export class InitializationService {
  private readonly logger = new Logger(InitializationService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(HomeEdit)
    private readonly homeRepository: Repository<HomeEdit>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async handleCron(): Promise<void> {
    this.logger.log('Starting Initialization');

    const adminExtId = '48a147e2-29b5-46e1-928c-dbb8d9d2e207';
    let admin = await this.userRepository.findOne({ where: { extId: adminExtId } });
    if (!admin) {
      admin = this.userRepository.create({
        name: 'admin',
        username: 'admin@gmail.com',
        phone: '',
        extId: adminExtId,
        isRegistered: true,
        isBlocked: false,
        isAgent: false,
        role: UsersTypes.ADMIN,
        isVatEnabled: true,
        isAllowOrder: false,
        isAllowAllClients: false,
        recovery: Math.floor(100000 + Math.random() * 900000),
        password: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.userRepository.save(admin);
      this.logger.log('Admin user initialized.');
    }

    const agentExtId = '2cca2cd6-2d37-4809-9520-cae76474113e';
    let agent = await this.userRepository.findOne({ where: { extId: agentExtId } });
    if (!agent) {
      agent = this.userRepository.create({
        name: 'agent',
        username: 'agent@gmail.com',
        phone: '',
        extId: agentExtId,
        isRegistered: true,
        isBlocked: false,
        isAgent: false,
        role: UsersTypes.SUPER_AGENT,
        isVatEnabled: true,
        isAllowOrder: false,
        isAllowAllClients: false,
        recovery: Math.floor(100000 + Math.random() * 900000),
        password: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.userRepository.save(agent);
      this.logger.log('Agent user initialized.');
    }

    const defaultHomeEdits = [
      { type: 'main', orden: 0, isVideo: false, isBanner: true, isActive: true, count: 1, countMobile: null, isPopUp: false, isDeletable: false },
      { type: 'categories', orden: 1, isVideo: false, isBanner: true, isActive: true, count: 4, countMobile: 2, isPopUp: false, isDeletable: false },
      { type: 'productsNew', orden: 3, isVideo: false, isBanner: true, isActive: true, count: 4, countMobile: 2, isPopUp: false, isDeletable: false },
      { type: 'productsSale', orden: 2, isVideo: false, isBanner: true, isActive: true, count: 4, countMobile: 2, isPopUp: false, isDeletable: false },
      { type: 'logos', orden: 4, isVideo: false, isBanner: true, isActive: true, count: 4, countMobile: null, isPopUp: false, isDeletable: false },
    ];

    for (const item of defaultHomeEdits) {
      const exists = await this.homeRepository.findOne({ where: { type: item.type } });
      if (!exists) {
        const home = this.homeRepository.create({
          type: item.type,
          orden: item.orden,
          isVideo: item.isVideo,
          isBanner: item.isBanner,
          isActive: item.isActive,
          count: item.count,
          countMobile: item.countMobile,
          isPopUp: item.isPopUp,
          isDeletable: item.isDeletable,
        });
        await this.homeRepository.save(home);
      }
    }

    this.logger.log('Initialization completed.');
  }
}