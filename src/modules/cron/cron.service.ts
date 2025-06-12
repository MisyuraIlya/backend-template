import {
  Injectable,
  OnModuleInit,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Cron as CronEntity } from './entities/cron.entity';
import { CronSettings } from './entities/cron-settings.entity';
import { CronJob } from 'cron';

import { GetAgentService } from './fetchers/GetAgents';
import { GetAttributeProducts } from './fetchers/GetAttributeProducts';
import { GetAttributesMainService } from './fetchers/GetAttributesMain';
import { GetAttributesSubService } from './fetchers/GetAttributesSub';
import { GetCategoriesService } from './fetchers/GetCategories';
import { GetPriceListsService } from './fetchers/GetPriceList';
import { GetPriceListDetailedService } from './fetchers/GetPriceListDetailed';
import { GetPriceListUserService } from './fetchers/GetPriceListUser';
import { GetProductPackagesService } from './fetchers/GetProductPackage';
import { GetProductsService } from './fetchers/GetProducts';
import { GetUsersService } from './fetchers/GetUsers';
import { GetVarietiesService } from './fetchers/GetVarieties';

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);

  /** one-per-jobName state for sync in-progress */
  private handlers: Record<
    string,
    { isSyncing: boolean; handleCron(): Promise<void> }
  > = {};

  /** blocks any other execution (scheduled or manual) when true */
  private manualExecution = false;

  constructor(
    @InjectRepository(CronEntity)
    private readonly cronRepo: Repository<CronEntity>,
    @InjectRepository(CronSettings)
    private readonly cronSettingsRepo: Repository<CronSettings>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly getAgentSvc: GetAgentService,
    private readonly getAttributeProductsSvc: GetAttributeProducts,
    private readonly getAttributesMainSvc: GetAttributesMainService,
    private readonly getAttributesSubSvc: GetAttributesSubService,
    private readonly getCategoriesSvc: GetCategoriesService,
    private readonly getPriceListsSvc: GetPriceListsService,
    private readonly getPriceListDetailedSvc: GetPriceListDetailedService,
    private readonly getPriceListUserSvc: GetPriceListUserService,
    private readonly getProductPackagesSvc: GetProductPackagesService,
    private readonly getProductsSvc: GetProductsService,
    private readonly getUsersSvc: GetUsersService,
    private readonly getVarietiesSvc: GetVarietiesService,
  ) {}

  async onModuleInit() {
    this.handlers = {
      AGENTS_SYNC: {
        isSyncing: false,
        handleCron: this.getAgentSvc.handleCron.bind(this.getAgentSvc),
      },
      ATTRIBUTE_PRODUCTS_SYNC: {
        isSyncing: false,
        handleCron: this.getAttributeProductsSvc.handleCron.bind(
          this.getAttributeProductsSvc,
        ),
      },
      ATTRIBUTES_MAIN_SYNC: {
        isSyncing: false,
        handleCron: this.getAttributesMainSvc.handleCron.bind(
          this.getAttributesMainSvc,
        ),
      },
      ATTRIBUTES_SUB_SYNC: {
        isSyncing: false,
        handleCron: this.getAttributesSubSvc.handleCron.bind(
          this.getAttributesSubSvc,
        ),
      },
      CATEGORIES_SYNC: {
        isSyncing: false,
        handleCron: this.getCategoriesSvc.handleCron.bind(
          this.getCategoriesSvc,
        ),
      },
      PRICE_LISTS_SYNC: {
        isSyncing: false,
        handleCron: this.getPriceListsSvc.handleCron.bind(
          this.getPriceListsSvc,
        ),
      },
      PRICE_LIST_DETAILED_SYNC: {
        isSyncing: false,
        handleCron: this.getPriceListDetailedSvc.handleCron.bind(
          this.getPriceListDetailedSvc,
        ),
      },
      PRICE_LIST_USER_SYNC: {
        isSyncing: false,
        handleCron: this.getPriceListUserSvc.handleCron.bind(
          this.getPriceListUserSvc,
        ),
      },
      PRODUCT_PACKAGES_SYNC: {
        isSyncing: false,
        handleCron: this.getProductPackagesSvc.handleCron.bind(
          this.getProductPackagesSvc,
        ),
      },
      PRODUCTS_SYNC: {
        isSyncing: false,
        handleCron: this.getProductsSvc.handleCron.bind(this.getProductsSvc),
      },
      USERS_SYNC: {
        isSyncing: false,
        handleCron: this.getUsersSvc.handleCron.bind(this.getUsersSvc),
      },
      VARIETIES_SYNC: {
        isSyncing: false,
        handleCron: this.getVarietiesSvc.handleCron.bind(this.getVarietiesSvc),
      },
    };

    const setting = await this.cronSettingsRepo.findOne({
      where: { isActive: true },
    });
    if (setting) {
      this.logger.log(`Scheduling main cron at "${setting.cronTime}"`);
      this.scheduleMainCron(setting.cronTime);
    } else {
      this.logger.log('No active cron settings found; main cron disabled.');
    }
  }

  public updateSchedule(cronTime: string, isActive: boolean) {
    if (isActive) this.scheduleMainCron(cronTime);
    else this.unscheduleMainCron();
  }

  private scheduleMainCron(cronTime: string) {
    const name = 'MainCron';
    if (this.schedulerRegistry.doesExist('cron', name)) {
      this.schedulerRegistry.getCronJob(name).stop();
      this.schedulerRegistry.deleteCronJob(name);
    }
    const job = new CronJob(
      cronTime,
      () => this.executeCrons(),
      null,
      false,
      'Asia/Jerusalem',
    );
    this.schedulerRegistry.addCronJob(name, job);
    job.start();
  }

  private unscheduleMainCron() {
    const name = 'MainCron';
    if (this.schedulerRegistry.doesExist('cron', name)) {
      this.schedulerRegistry.getCronJob(name).stop();
      this.schedulerRegistry.deleteCronJob(name);
      this.logger.log('Unscheduled MainCron');
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  private async executeCrons() {
    if (this.manualExecution) {
      this.logger.warn('Skipping scheduled run; manual run in progress');
      return;
    }

    const crons = await this.cronRepo.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });

    for (let i = 0; i < crons.length; i++) {
      const cron = crons[i];
      const handler = this.handlers[cron.jobName];
      if (handler.isSyncing) {
        this.logger.warn(`"${cron.jobName}" already running; skip`);
        continue;
      }

      handler.isSyncing = true;
      const start = Date.now();
      try {
        await handler.handleCron();
        cron.status = false;
        cron.error = null;
      } catch (err) {
        cron.status = true;
        cron.error = (err as Error).stack || (err as Error).message;
        this.logger.error(`Error in "${cron.jobName}": ${cron.error}`);
      } finally {
        handler.isSyncing = false;
        cron.lastFetchTime = new Date();
        cron.duration = Date.now() - start;
        await this.cronRepo.save(cron);
      }

      if (i < crons.length - 1) {
        this.logger.log(`Waiting 5 minutes before next cron…`);
        await this.sleep(5 * 60 * 1000);
      }
    }
  }

  async run(jobName: string) {
    if (this.manualExecution) {
      return { status: false, message: 'Manual run already in progress.' };
    }
    const handler = this.handlers[jobName];
    if (!handler) throw new NotFoundException(`No cron "${jobName}"`);

    this.manualExecution = true;
    handler.isSyncing = true;
    const start = Date.now();
    try {
      const cfg = await this.cronRepo.findOneBy({ jobName });
      if (!cfg || !cfg.isActive) {
        return { status: false, message: `Cron "${jobName}" is not active.` };
      }

      await handler.handleCron();
      cfg.status = false;
      cfg.error = null;
      return { status: true, message: `"${jobName}" ran successfully.` };
    } catch (err) {
      const msg = (err as Error).stack || (err as Error).message;
      await this.cronRepo.update(
        { jobName },
        {
          status: true,
          error: msg,
          lastFetchTime: new Date(),
          duration: Date.now() - start,
        },
      );
      return { status: false, message: `Error: ${msg}` };
    } finally {
      handler.isSyncing = false;
      this.manualExecution = false;
    }
  }

  public async runAllCrons(): Promise<{ status: boolean; message: string }> {
    if (this.manualExecution) {
      return { status: false, message: 'Manual run already in progress.' };
    }
    this.manualExecution = true;
    try {
      await this.executeCrons();
      return { status: true, message: 'All crons executed successfully.' };
    } catch (err) {
      return { status: false, message: (err as Error).message };
    } finally {
      this.manualExecution = false;
    }
  }

  async create(dto: { jobName: string; label: string, isActive?: boolean }) {
    const ent = this.cronRepo.create({ jobName: dto.jobName, label: dto.label, isActive: dto.isActive ?? true, status: false });
    await this.cronRepo.save(ent);
    return ent;
  }

  async update(id: number, dto: { cronTime?: string; isActive?: boolean, order?: number }) {
    const ent = await this.cronRepo.findOneByOrFail({ id });
    let needsReschedule = false;
    if (dto.cronTime && dto.cronTime) {
      needsReschedule = ent.isActive;
    }
    if (dto.isActive !== undefined && dto.isActive !== ent.isActive) {
      ent.isActive = dto.isActive;
    }
    if (dto.order !== undefined && dto.order !== ent.order) {
      ent.order = dto.order;
    }
    await this.cronRepo.save(ent);
    return ent;
  }

  async findAll(): Promise<CronEntity[]> {
    return this.cronRepo.find();
  }

  async findOne(id: number): Promise<CronEntity> {
    return this.cronRepo.findOneByOrFail({ id });
  }

  async getStatus(jobName: string) {
    const ent = await this.cronRepo.findOneBy({ jobName });
    if (!ent) {
      return { exists: false };
    }

    const handler = this.handlers[jobName];
    const running = handler?.isSyncing ?? false;
    const isCanRun = ent.isActive && !running && !this.manualExecution;

    return {
      exists: true,
      running,                  
      lastFetchTime: ent.lastFetchTime,
      status: ent.status,       
      error: ent.error,
      duration: ent.duration,
      isActive: ent.isActive,
      id: ent.id,
      isCanRun,                 
    };
  }
}
