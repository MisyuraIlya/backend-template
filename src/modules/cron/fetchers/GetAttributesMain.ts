import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ErpManager } from "src/erp/erp.manager";
import { AttributeMain } from "src/modules/attribute-main/entities/attribute-main.entity";

@Injectable()
export class GetAttributesMainService {
  private readonly logger = new Logger(GetAttributesMainService.name);
  private readonly PAGE_SIZE = 100;
  public isSyncing = false;

  constructor(
    @InjectRepository(AttributeMain)
    private readonly attributesMainRepo: Repository<AttributeMain>,
    private readonly erpManager: ErpManager,
  ) {}

  public async sync(): Promise<void> {
    let skip = 0;
    const unique = new Map<string, string>();

    while (true) {
      this.logger.log(`Fetching ERP products batch (skip=${skip}, top=${this.PAGE_SIZE})`);
      const batch = await this.erpManager.GetProducts(this.PAGE_SIZE, skip) ?? [];
      if (!batch.length) {
        this.logger.log('No more products to process; moving to upsert');
        break;
      }
      for (const dto of batch) {
        if (!dto) continue;
        const extras: Array<[string?, string?]> = [
          [dto.Extra12!, dto.Extra12!],
          [dto.Extra16!, dto.Extra16!],
          [dto.Extra20!, dto.Extra20!],
        ];
        for (const [id, title] of extras) {
          if (id && title && !unique.has(id)) {
            unique.set(id, title);
          }
        }
      }

      skip += this.PAGE_SIZE;
    }

    const existing = await this.attributesMainRepo.find();
    const existingMap = new Map(existing.map(a => [a.extId, a]));

    let ordenCounter = 1;
    for (const [extId, title] of unique) {
      let attr = existingMap.get(extId);
      if (!attr) {
        attr = this.attributesMainRepo.create({
          extId,
          title,
          isPublished: true,
          isInProductCard: true,
          isInFilter: true,
          orden: ordenCounter++,
        });
      } else {
        attr.title = title;
        attr.orden = ordenCounter++;
      }
      await this.attributesMainRepo.save(attr);
    }

    this.logger.log(`Synchronized ${unique.size} AttributeMain records`);
  }

//  @Cron(CronExpression.EVERY_MINUTE, { timeZone: 'Asia/Jerusalem' })
  public async handleCron() {
    if (this.isSyncing) {
      this.logger.log('Previous sync still running — skipping this tick');
      return;
    }
    this.isSyncing = true;
    this.logger.log('Cron job: starting ERP attribute main sync');

    try {
      await this.sync();
      this.logger.log('Cron job: ERP attribute main sync completed successfully');
    } catch (error) {
      this.logger.error('Cron job: ERP attribute main sync failed', (error as Error).stack);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }
}
