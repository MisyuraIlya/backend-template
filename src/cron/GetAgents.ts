import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { ErpManager } from "src/erp/erp.manager";
import { User } from "src/modules/user/entities/user.entity";
import { UsersTypes } from "src/modules/user/enums/UsersTypes";
import { In, Repository } from "typeorm";

@Injectable()
export class GetAgentService {
    private readonly logger = new Logger(GetAgentService.name);
    private isSyncing = false;

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly erpManager: ErpManager,
    ){}

    public async sync(): Promise<void> {
        const agents = await this.erpManager.GetAgents();
        if (!Array.isArray(agents) || agents.length === 0) {
            this.logger.warn('No users returned from ERP');
            return;
        }

        for (const dto of agents) {
            let agent = await this.userRepository.findOne({
                where: {
                    extId: dto.userExId,
                    role: In([UsersTypes.AGENT, UsersTypes.SUPER_AGENT]),
                },
            })
            if(!agent){
               agent = new User()
               agent.extId = dto.userExId 
               agent.createdAt = new Date();
               agent.isRegistered = false
               agent.role = UsersTypes.AGENT
            }
            agent.isAgent = true;
            agent.isBlocked = dto.isBlocked ?? false;
            agent.name = dto.name!;
            agent.search = `${dto.userExId} ${dto.name}`;
            agent.updatedAt = new Date();
            agent.isAllowOrder = true;
            this.userRepository.save(agent)
        }
    }

    // @Cron(CronExpression.EVERY_MINUTE, { timeZone: 'Asia/Jerusalem' })
    public async handleCron() {
        if (this.isSyncing) {
            this.logger.log('Previous sync still running — skipping this tick');
            return;
        }
        this.isSyncing = true;
        this.logger.log('Cron job: starting ERP agent sync');

        try {
            await this.sync();
            this.logger.log('Cron job: ERP agent sync completed successfully');
        } catch (error) {
            this.logger.error(
                'Cron job: ERP agent sync failed',
                (error as Error).stack,
            );
        } finally {
            this.isSyncing = false;
        }
    }
}