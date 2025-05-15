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
  private isSyncing = false;

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
      // 1️⃣ Find product by SKU
      const product = await this.productRepo.findOne({
        where: { sku: dto.sku },
      });
      if (!product) {
        continue;
      }

      // 2️⃣ Find pricelist by name
      const priceListEntity = await this.priceListRepo.findOne({
        where: { extId: dto.priceList },
      });
      if (!priceListEntity) {
        this.logger.warn(`PriceList not found in DB: ${dto.priceList}`);
        continue;
      }

      // 3️⃣ Look for existing detailed entry
      let detailed = await this.priceListDetailedRepo.findOne({
        where: {
          product: { id: product.id },
          priceList: { id: priceListEntity.id },
        }
      });

      if (!detailed) {
        // create new
        detailed = this.priceListDetailedRepo.create({
          product,
          priceList: priceListEntity,
          price:   dto.price!,
          discount: dto.discount ?? 0,
        });
      } else {
        // update existing
        detailed.price    = dto.price!;
        detailed.discount = dto.discount ?? 0;
      }

      // 4️⃣ Save to DB
      await this.priceListDetailedRepo.save(detailed);
    }
  }

  // ⏰ Re-enable if you want it to run every minute in Asia/Jerusalem
//   @Cron(CronExpression.EVERY_MINUTE, { timeZone: 'Asia/Jerusalem' })
  public async handleCron() {
    if (this.isSyncing) {
      this.logger.log('Previous sync still running — skipping this tick');
      return;
    }
    this.isSyncing = true;
    this.logger.log('Cron job: starting ERP price list detailed sync');

    try {
      await this.sync();
      this.logger.log('Cron job: ERP price list detailed sync completed successfully');
    } catch (error) {
      this.logger.error(
        'Cron job: ERP price list detailed sync failed',
        (error as Error).stack,
      );
    } finally {
      this.isSyncing = false;
    }
  }
}
