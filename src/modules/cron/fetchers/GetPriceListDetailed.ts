import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ErpManager } from "src/erp/erp.manager";
import { PriceListDetailed } from "src/modules/price-list-detailed/entities/price-list-detailed.entity";
import { PriceList } from "src/modules/price-list/entities/price-list.entity";
import { Product } from "src/modules/product/entities/product.entity";

@Injectable()
export class GetPriceListDetailedService {
  private readonly logger = new Logger(GetPriceListDetailedService.name);
  public isSyncing = false;

  constructor(
    @InjectRepository(PriceListDetailed)
    private readonly priceListDetailedRepo: Repository<PriceListDetailed>,

    @InjectRepository(PriceList)
    private readonly priceListRepo: Repository<PriceList>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    private readonly erpManager: ErpManager,
  ) {}

  public async sync(): Promise<void> {
    const data = await this.erpManager.GetPriceListDetailed();
    if (!Array.isArray(data) || data.length === 0) {
      this.logger.warn('No data returned from ERP');
      return;
    }

    for (const dto of data) {
      const product = await this.productRepo.findOne({
        where: { sku: dto.sku },
      });
      if (!product) {
        continue;
      }

      const priceListEntity = await this.priceListRepo.findOne({
        where: { extId: dto.priceList },
      });
      if (!priceListEntity) {
        this.logger.warn(`PriceList not found in DB: ${dto.priceList}`);
        continue;
      }

      let detailed = await this.priceListDetailedRepo.findOne({
        where: {
          product: { id: product.id },
          priceList: { id: priceListEntity.id },
        }
      });

      if (!detailed) {
        detailed = this.priceListDetailedRepo.create({
          product,
          priceList: priceListEntity,
          price:   dto.price!,
          discount: dto.discount ?? 0,
        });
      } else {
        detailed.price    = dto.price!;
        detailed.discount = dto.discount ?? 0;
      }

      await this.priceListDetailedRepo.save(detailed);
    }
  }

  public async handleCron(): Promise<void> {
    if (this.isSyncing) {
      this.logger.log({
        context: GetPriceListDetailedService.name,
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
        context: GetPriceListDetailedService.name,
        level: 'info',
        message: `Cron job: ERP price list detailed sync completed successfully in ${durationMs}ms`,
        CRON_SUCCEEDED: true,
        durationMs,
      });
    } catch (err) {
      const durationMs = Date.now() - start;
      this.logger.error({
        context: GetPriceListDetailedService.name,
        message: `Cron job: ERP price list detailed sync failed after ${durationMs}ms`,
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
