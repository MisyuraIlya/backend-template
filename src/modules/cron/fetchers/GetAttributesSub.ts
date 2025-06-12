import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ErpManager } from "src/erp/erp.manager";
import { AttributeMain } from "src/modules/attribute-main/entities/attribute-main.entity";
import { AttributeSub } from "src/modules/attribute-sub/entities/attribute-sub.entity";

@Injectable()
export class GetAttributesSubService {
  private readonly logger = new Logger(GetAttributesSubService.name);
  private readonly PAGE_SIZE = 1000;
  public isSyncing = false;

  constructor(
    @InjectRepository(AttributeSub)
    private readonly attributesSubRepository: Repository<AttributeSub>,
    @InjectRepository(AttributeMain)
    private readonly attributeMainRepository: Repository<AttributeMain>,
    private readonly erpManager: ErpManager,
  ) {}

  public async sync(): Promise<void> {
    let skip = 0;
    const uniqueSubs = new Map<string, { mainExtId: string; title: string }>();

    while (true) {
      this.logger.log(`Fetching ERP products batch (skip=${skip}, top=${this.PAGE_SIZE})`);
      const batch = await this.erpManager.GetProducts(this.PAGE_SIZE, skip) ?? [];
      if (!batch.length) {
        this.logger.log('No more products to process for sub‐attributes');
        break;
      }

      for (const dto of batch) {
        if (!dto) continue;
        const mappings = [
          { mainId: dto.Extra12!, subTitle: dto.Extra14! },
          { mainId: dto.Extra16!, subTitle: dto.Extra18! },
          { mainId: dto.Extra20!, subTitle: dto.Extra22! },
        ];
        for (const { mainId, subTitle } of mappings) {
          if (mainId && subTitle) {
            const key = `${mainId}-${subTitle}`;
            if (!uniqueSubs.has(key)) {
              uniqueSubs.set(key, { mainExtId: mainId, title: subTitle });
            }
          }
        }
      }

      skip += this.PAGE_SIZE;
    }

    const mains = await this.attributeMainRepository.find();
    const mainsMap = new Map(mains.map(m => [m.extId, m]));

    const existingSubs = await this.attributesSubRepository.find({ relations: ['attribute'] });
    const existingMap = new Map(
      existingSubs.map(s => [`${s.attribute.extId}-${s.title}`, s])
    );

    let ordenCounter = 1;
    for (const { mainExtId, title } of uniqueSubs.values()) {
      const parent = mainsMap.get(mainExtId);
      if (!parent) {
        this.logger.warn(`AttributeMain not found for extId=${mainExtId}`);
        continue;
      }

      const key = `${mainExtId}-${title}`;
      let sub = existingMap.get(key);

      if (!sub) {
        sub = this.attributesSubRepository.create({
          attribute: parent,
          title,
          isPublished: true,
          orden: ordenCounter++,
          productCount: 0,          
        });
      } else {
        sub.title = title;
        sub.orden = ordenCounter++;
      }

      await this.attributesSubRepository.save(sub);
    }

    this.logger.log(`Synchronized ${uniqueSubs.size} AttributeSub records`);
  }

  public async handleCron(): Promise<void> {
    if (this.isSyncing) {
      this.logger.log({
        context: GetAttributesSubService.name,
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
        context: GetAttributesSubService.name,
        level: 'info',
        message: `Cron job: ERP attribute sub sync completed successfully in ${durationMs}ms`,
        CRON_SUCCEEDED: true,
        durationMs,
      });
    } catch (err) {
      const durationMs = Date.now() - start;
      this.logger.error({
        context: GetAttributesSubService.name,
        message: `Cron job: ERP attribute sub sync failed after ${durationMs}ms`,
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
