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
  public async handleCron(): Promise<void> {
    if (this.isSyncing) {
      this.logger.log({
        context: GetProductPackagesService.name,
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
        context: GetProductPackagesService.name,
        level: 'info',
        message: `Cron job: ERP products sync completed successfully in ${durationMs}ms`,
        CRON_SUCCEEDED: true,
        durationMs,
      });
    } catch (err) {
      const durationMs = Date.now() - start;
      this.logger.error({
        context: GetProductPackagesService.name,
        message: `Cron job: ERP products sync failed after ${durationMs}ms`,
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
