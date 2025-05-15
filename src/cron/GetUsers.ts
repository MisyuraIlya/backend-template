import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { UsersTypes } from 'src/modules/user/enums/UsersTypes';
import { ErpManager } from 'src/erp/erp.manager';
import { UserDto } from 'src/erp/dto/user.dto';

@Injectable()
export class GetUsersService {
  private readonly logger = new Logger(GetUsersService.name);
  private isSyncing = false;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly erpManager: ErpManager,
  ) {}


  private mapDtoToUser(
    dto: UserDto,
    user: User | null,
    parent?: User,
  ): User {
    if (!user) {
      user = new User();
      user.extId = dto.userExId;
      user.phone = dto.phone!;
      user.createdAt = new Date();
      user.isRegistered = false;
      if (parent) {
        user.parent = parent;
      }
    }

    user.isAgent = false;
    user.role = UsersTypes.USER;
    user.isBlocked = dto.isBlocked!;
    user.name = dto.name ?? user.name!;
    user.city = dto.town!;
    user.address = dto.address!;
    user.isVatEnabled = dto.isVatEnabled!;
    user.maxCredit = dto.maxCredit ?? user.maxCredit;
    user.maxObligo = dto.maxObligo ?? 0;
    user.payCode = dto.payCode!;
    user.PayDes = dto.payDes!;
    user.hp = dto.hp!;
    user.taxCode = dto.taxCode!;
    user.isAllowOrder = true;
    user.isAllowAllClients = false;
    user.salesCurrency = dto.salesCurrency!;
    user.updatedAt = new Date();
    user.search = `${dto.userExId} ${dto.name}`;

    return user;
  }

  private async syncChildUsers(
    children: UserDto[] = [],
    parent: User,
    repo: Repository<User>,
  ): Promise<void> {
    for (const childDto of children) {
      if (!childDto.userExId || childDto.isBlocked) continue;

      let childUser = await repo.findOne({
        where: { extId: childDto.userExId, phone: childDto.phone },
      });

      childUser = this.mapDtoToUser(childDto, childUser, parent);

      if (childDto.agentCode) {
        const agent = await repo.findOne({
          where: {
            extId: childDto.agentCode,
            role: In([UsersTypes.AGENT, UsersTypes.SUPER_AGENT]),
          },
        });
        if (agent) {
          childUser.agent = agent;
        }
      }

      await repo.save(childUser);
    }
  }


  // @Cron(CronExpression.EVERY_MINUTE, { timeZone: 'Asia/Jerusalem' })
  public async handleCron(): Promise<void> {
    if (this.isSyncing) {
      this.logger.log('Previous sync still running — skipping this tick');
      return;
    }
    this.isSyncing = true;

    this.logger.log('Cron job: starting ERP user sync');
    try {
      await this.syncAllUsers();
      this.logger.log('Cron job: ERP user sync completed successfully');
    } catch (error) {
      this.logger.error(
        'Cron job: ERP user sync failed',
        (error as Error).stack,
      );
    } finally {
      this.isSyncing = false;
    }
  }


  public async syncAllUsers(): Promise<void> {
    const erpUsers = await this.erpManager.GetUsers();
    if (!Array.isArray(erpUsers) || erpUsers.length === 0) {
      this.logger.warn('No users returned from ERP');
      return;
    }

    for (const dto of erpUsers) {
      await this.userRepo.manager.transaction(async (manager) => {
        const repo = manager.getRepository(User);

        let user = await repo.findOne({
          where: { extId: dto.userExId, phone: dto.phone },
        });

        user = this.mapDtoToUser(dto, user);

        if (dto.agentCode) {
          const agent = await repo.findOne({
            where: {
              extId: dto.agentCode,
              role: In([UsersTypes.AGENT, UsersTypes.SUPER_AGENT]),
            },
          });
          if (agent) {
            user.agent = agent;
          }
        }

        user = await repo.save(user);

        await this.syncChildUsers(dto.subUsers, user, repo);
      });
    }
  }
}
