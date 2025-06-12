import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ErpManager } from "src/erp/erp.manager";
import { PriceList } from "src/modules/price-list/entities/price-list.entity";

export interface PriceListDto {
  priceListExtId?: string | null;
  priceListTitle?: string | null;
  priceListExperationDate?: string | null;
}

@Injectable()
export class GetPriceListsService {
  private readonly logger = new Logger(GetPriceListsService.name);
  public isSyncing = false;

  constructor(
    @InjectRepository(PriceList)
    private readonly priceListRepository: Repository<PriceList>,
    private readonly erpManager: ErpManager,
  ) {}

  public async sync(): Promise<void> {
    const data: PriceListDto[] = await this.erpManager.GetPriceList();

    if (!Array.isArray(data) || data.length === 0) {
      this.logger.warn('No data returned from ERP');
      return;
    }

    for (const dto of data) {
      if (!dto.priceListExtId) {
        this.logger.warn('Skipping ERP item with no external ID', JSON.stringify(dto));
        continue;
      }

      let priceList = await this.priceListRepository.findOne({
        where: { extId: dto.priceListExtId },
      });

      if (!priceList) {
        priceList = this.priceListRepository.create({
          extId: dto.priceListExtId,
          title: dto.priceListTitle ?? undefined,
        });
        this.logger.log(`Creating new PriceList ${dto.priceListExtId}`);
      } else {
        priceList.title = dto.priceListTitle ?? priceList.title;
        this.logger.log(`Updating PriceList ${dto.priceListExtId}`);
      }

      await this.priceListRepository.save(priceList);
    }
  }

  public async handleCron(): Promise<void> {
    if (this.isSyncing) {
      this.logger.log({
        context: GetPriceListsService.name,
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
        context: GetPriceListsService.name,
        level: 'info',
        message: `Cron job: ERP price lists sync completed successfully in ${durationMs}ms`,
        CRON_SUCCEEDED: true,
        durationMs,
      });
    } catch (err) {
      const durationMs = Date.now() - start;
      this.logger.error({
        context: GetPriceListsService.name,
        message: `Cron job: ERP price lists sync failed after ${durationMs}ms`,
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
