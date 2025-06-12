import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggerService } from '@nestjs/common';

import { ErpManager } from 'src/erp/erp.manager';
import { User } from 'src/modules/user/entities/user.entity';
import { UsersTypes } from 'src/modules/user/enums/UsersTypes';

@Injectable()
export class GetAgentService {
  public isSyncing = false;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly erpManager: ErpManager,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  private async sync(): Promise<void> {
    const agents = await this.erpManager.GetAgents();
    if (!Array.isArray(agents) || agents.length === 0) {
      this.logger.warn({
        context: 'CRON_AGENTS',
        level: 'warn',
        message: 'No users returned from ERP',
        CRON_SUCCEEDED: false,
      });
      return;
    }
    for (const dto of agents) {
      let agent = await this.userRepository.findOne({
        where: {
          extId: dto.userExId,
          role: In([UsersTypes.AGENT, UsersTypes.SUPER_AGENT]),
        },
      });
      if (!agent) {
        agent = new User();
        agent.extId = dto.userExId;
        agent.createdAt = new Date();
        agent.isRegistered = false;
        agent.role = UsersTypes.AGENT;
      }
      agent.isAgent = true;
      agent.isBlocked = dto.isBlocked ?? false;
      agent.name = dto.name!;
      agent.search = `${dto.userExId} ${dto.name}`;
      agent.updatedAt = new Date();
      agent.isAllowOrder = true;
      await this.userRepository.save(agent);
    }
  }

  public async handleCron(): Promise<void> {
    if (this.isSyncing) {
      this.logger.log({
        context: GetAgentService.name,
        level: 'info',
        message: 'Previous sync still running — skipping this tick',
        CRON_SUCCEEDED: false,
      });
      return;
    }
    this.isSyncing = true;
    const start = Date.now();
    try {
      await this.sync();
      const durationMs = Date.now() - start;
      this.logger.log({
        context: GetAgentService.name,
        level: 'info',
        message: `Cron job: ERP agent sync completed successfully in ${durationMs}ms`,
        CRON_SUCCEEDED: true,
        durationMs,
      });
    } catch (err) {
      const durationMs = Date.now() - start;
      this.logger.error({
        context: GetAgentService.name,
        message: `Cron job: ERP agent sync failed after ${durationMs}ms`,
        CRON_SUCCEEDED: false,
        durationMs,
        stack: (err as Error).stack,
      });
      throw err;
    } finally {
      this.isSyncing = false;
    }
  }
}
