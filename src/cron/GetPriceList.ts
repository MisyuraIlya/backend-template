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
  private isSyncing = false;

  constructor(
    @InjectRepository(PriceList)
    private readonly priceListRepository: Repository<PriceList>,
    private readonly erpManager: ErpManager,
  ) {}

  /**
   * Fetches all price lists from the ERP and upserts them into the DB.
   */
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

      // Try to find an existing price list by external ID
      let priceList = await this.priceListRepository.findOne({
        where: { extId: dto.priceListExtId },
      });

      if (!priceList) {
        // Create new if not exists
        priceList = this.priceListRepository.create({
          extId: dto.priceListExtId,
          title: dto.priceListTitle ?? undefined,
        });
        this.logger.log(`Creating new PriceList ${dto.priceListExtId}`);
      } else {
        // Update fields on existing entity
        priceList.title = dto.priceListTitle ?? priceList.title;
        this.logger.log(`Updating PriceList ${dto.priceListExtId}`);
      }

      // Persist create or update
      await this.priceListRepository.save(priceList);
    }
  }

  /**
   * Runs every minute (Asia/Jerusalem) and guards against overlapping executions.
   */
//   @Cron(CronExpression.EVERY_MINUTE, { timeZone: 'Asia/Jerusalem' })
  public async handleCron() {
    if (this.isSyncing) {
      this.logger.log('Previous sync still running — skipping this tick');
      return;
    }
    this.isSyncing = true;
    this.logger.log('Cron job: starting ERP price lists sync');

    try {
      await this.sync();
      this.logger.log('Cron job: ERP price lists sync completed successfully');
    } catch (error) {
      this.logger.error(
        'Cron job: ERP price lists sync failed',
        (error as Error).stack,
      );
    } finally {
      this.isSyncing = false;
    }
  }
}
