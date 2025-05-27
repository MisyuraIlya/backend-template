import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ErpManager } from "src/erp/erp.manager";
import { Product } from "src/modules/product/entities/product.entity";
import { ProductPackage } from "src/modules/product-package/entities/product.entity";

@Injectable()
export class GetProductPackagesService {
  private readonly logger = new Logger(GetProductPackagesService.name);
  private readonly PAGE_SIZE = 100;
  public isSyncing = false;

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductPackage)
    private readonly productPackageRepository: Repository<ProductPackage>,
    private readonly erpManager: ErpManager,
  ) {}

  public async sync(): Promise<void> {
    let skip = 0;
    // IMPLEMENT

  }

  /** Runs every minute (Asia/Jerusalem) */
  // @Cron(CronExpression.EVERY_MINUTE, { timeZone: 'Asia/Jerusalem' })
  public async handleCron() {
    if (this.isSyncing) {
      this.logger.log('Previous sync still running — skipping this tick');
      return;
    }
    this.isSyncing = true;
    this.logger.log('Cron job: starting ERP products sync');

    try {
      await this.sync();
      this.logger.log('Cron job: ERP products sync completed successfully');
    } catch (error) {
      this.logger.error(
        'Cron job: ERP products sync failed',
        (error as Error).stack,
      );
    } finally {
      this.isSyncing = false;
    }
  }
}
