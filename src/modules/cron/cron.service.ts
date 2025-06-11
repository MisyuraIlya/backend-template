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
  private readonly handlers: Record<
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
  ) {
    this.handlers['AGENTS_SYNC'] = this.getAgentSvc;
    this.handlers['ATTRIBUTE_PRODUCTS_SYNC'] = this.getAttributeProductsSvc;
    this.handlers['ATTRIBUTES_MAIN_SYNC'] = this.getAttributesMainSvc;
    this.handlers['ATTRIBUTES_SUB_SYNC'] = this.getAttributesSubSvc;
    this.handlers['CATEGORIES_SYNC'] = this.getCategoriesSvc;
    this.handlers['PRICE_LISTS_SYNC'] = this.getPriceListsSvc;
    this.handlers['PRICE_LIST_DETAILED_SYNC'] = this.getPriceListDetailedSvc;
    this.handlers['PRICE_LIST_USER_SYNC'] = this.getPriceListUserSvc;
    this.handlers['PRODUCT_PACKAGES_SYNC'] = this.getProductPackagesSvc;
    this.handlers['PRODUCTS_SYNC'] = this.getProductsSvc;
    this.handlers['USERS_SYNC'] = this.getUsersSvc;
    this.handlers['VARIETIES_SYNC'] = this.getVarietiesSvc;
  }

  async onModuleInit() {
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

    const start = Date.now();
    try {
      this.logger.debug(`Running cron "${jobName}"`);
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
      cfg.lastFetchTime = new Date();
      cfg.status = false;
    } catch (err) {
      cfg.lastFetchTime = new Date();
      cfg.status = true;
      this.logger.error(`Error in "${jobName}": ${(err as Error).message}`, (err as Error).stack);
    } finally {
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