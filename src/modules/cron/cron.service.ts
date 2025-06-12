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
  private handlers: Record<
    string,
    { isSyncing: boolean; handleCron(): Promise<void> }
  > = {};

  constructor(
    @InjectRepository(CronEntity)
    private readonly cronRepo: Repository<CronEntity>,
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
      AGENTS_SYNC: { isSyncing: false, handleCron: this.getAgentSvc.handleCron.bind(this.getAgentSvc) },
      ATTRIBUTE_PRODUCTS_SYNC: { isSyncing: false, handleCron: this.getAttributeProductsSvc.handleCron.bind(this.getAttributeProductsSvc) },
      ATTRIBUTES_MAIN_SYNC: { isSyncing: false, handleCron: this.getAttributesMainSvc.handleCron.bind(this.getAttributesMainSvc) },
      ATTRIBUTES_SUB_SYNC: { isSyncing: false, handleCron: this.getAttributesSubSvc.handleCron.bind(this.getAttributesSubSvc) },
      CATEGORIES_SYNC: { isSyncing: false, handleCron: this.getCategoriesSvc.handleCron.bind(this.getCategoriesSvc) },
      PRICE_LISTS_SYNC: { isSyncing: false, handleCron: this.getPriceListsSvc.handleCron.bind(this.getPriceListsSvc) },
      PRICE_LIST_DETAILED_SYNC: { isSyncing: false, handleCron: this.getPriceListDetailedSvc.handleCron.bind(this.getPriceListDetailedSvc) },
      PRICE_LIST_USER_SYNC: { isSyncing: false, handleCron: this.getPriceListUserSvc.handleCron.bind(this.getPriceListUserSvc) },
      PRODUCT_PACKAGES_SYNC: { isSyncing: false, handleCron: this.getProductPackagesSvc.handleCron.bind(this.getProductPackagesSvc) },
      PRODUCTS_SYNC: { isSyncing: false, handleCron: this.getProductsSvc.handleCron.bind(this.getProductsSvc) },
      USERS_SYNC: { isSyncing: false, handleCron: this.getUsersSvc.handleCron.bind(this.getUsersSvc) },
      VARIETIES_SYNC: { isSyncing: false, handleCron: this.getVarietiesSvc.handleCron.bind(this.getVarietiesSvc) },
    };

    const all = await this.cronRepo.find();
    for (const cfg of all) {
      if (cfg.isActive) {
        this.scheduleJob(cfg.jobName, cfg.cronTime);
      }
    }
  }

  private scheduleJob(jobName: string, cronTime: string) {
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      const old = this.schedulerRegistry.getCronJob(jobName);
      old.stop();
      this.schedulerRegistry.deleteCronJob(jobName);
    }
    const job = new CronJob(cronTime, () => this.dispatch(jobName), null, false, 'Asia/Jerusalem');
    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();
    this.logger.log(`Scheduled "${jobName}" → ${cronTime}`);
  }

  private async dispatch(jobName: string) {
    const cfg = await this.cronRepo.findOneBy({ jobName });
    if (!cfg || !cfg.isActive) return;

    if (this.handlers[jobName].isSyncing) {
      this.logger.warn(`Cron job "${jobName}" is already running. Skipping.`);
      return;
    }

    this.handlers[jobName].isSyncing = true;
    const start = Date.now();
    try {
      this.logger.debug(`Running cron "${jobName}"`);
      try {
        switch (jobName) {
          case 'AGENTS_SYNC':
            await this.getAgentSvc.handleCron();
            break;
          case 'ATTRIBUTE_PRODUCTS_SYNC':
            await this.getAttributeProductsSvc.handleCron();
            break;
          case 'ATTRIBUTES_MAIN_SYNC':
            await this.getAttributesMainSvc.handleCron();
            break;
          case 'ATTRIBUTES_SUB_SYNC':
            await this.getAttributesSubSvc.handleCron();
            break;
          case 'CATEGORIES_SYNC':
            await this.getCategoriesSvc.handleCron();
            break;
          case 'PRICE_LISTS_SYNC':
            await this.getPriceListsSvc.handleCron();
            break;
          case 'PRICE_LIST_DETAILED_SYNC':
            await this.getPriceListDetailedSvc.handleCron();
            break;
          case 'PRICE_LIST_USER_SYNC':
            await this.getPriceListUserSvc.handleCron();
            break;
          case 'PRODUCT_PACKAGES_SYNC':
            await this.getProductPackagesSvc.handleCron();
            break;
          case 'PRODUCTS_SYNC':
            await this.getProductsSvc.handleCron();
            break;
          case 'USERS_SYNC':
            await this.getUsersSvc.handleCron();
            break;
          case 'VARIETIES_SYNC':
            await this.getVarietiesSvc.handleCron();
            break;
          default:
            this.logger.warn(`No handler for "${jobName}"`);
        }
      } catch (error) {
        this.logger.error(`Error in cron job "${jobName}": ${(error as Error).message}`, (error as Error).stack);
      }
      cfg.lastFetchTime = new Date();
      cfg.status = false;
    } catch (err) {
      cfg.lastFetchTime = new Date();
      cfg.status = true;
      this.logger.error(`Error in "${jobName}": ${(err as Error).message}`, (err as Error).stack);
    } finally {
      this.handlers[jobName].isSyncing = false;
      cfg.duration = Date.now() - start;
      await this.cronRepo.save(cfg);
    }
  }

  async create(dto: { jobName: string; label: string, cronTime: string; isActive?: boolean }) {
    const ent = this.cronRepo.create({ jobName: dto.jobName, label: dto.label, cronTime: dto.cronTime, isActive: dto.isActive ?? true, status: false });
    await this.cronRepo.save(ent);
    if (ent.isActive) this.scheduleJob(ent.jobName, ent.cronTime);
    return ent;
  }

  async update(id: number, dto: { cronTime?: string; isActive?: boolean }) {
    const ent = await this.cronRepo.findOneByOrFail({ id });
    let needsReschedule = false;
    if (dto.cronTime && dto.cronTime !== ent.cronTime) {
      ent.cronTime = dto.cronTime;
      needsReschedule = ent.isActive;
    }
    if (dto.isActive !== undefined && dto.isActive !== ent.isActive) {
      ent.isActive = dto.isActive;
      if (!ent.isActive) {
        const job = this.schedulerRegistry.getCronJob(ent.jobName);
        job.stop();
        this.schedulerRegistry.deleteCronJob(ent.jobName);
      } else {
        needsReschedule = true;
      }
    }
    await this.cronRepo.save(ent);
    if (needsReschedule) this.scheduleJob(ent.jobName, ent.cronTime);
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
    if (!ent) return { exists: false };
    const handler = this.handlers[jobName];
    return { 
      exists: true, 
      running: handler?.isSyncing ?? false, 
      lastFetchTime: ent.lastFetchTime, 
      status: ent.status, 
      duration: ent.duration, 
      isActive: ent.isActive,
      id: ent.id,
    };
  }

  async run(jobName: string) {
    if (!this.schedulerRegistry.doesExist('cron', jobName)) {
      throw new NotFoundException(`No cron job "${jobName}"`);
    }
    await this.dispatch(jobName);
    return { status: true, message: `Job "${jobName}" started` };
  }
}
