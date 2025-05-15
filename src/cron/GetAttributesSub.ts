// src/modules/get-attributes-sub/get-attributes-sub.service.ts
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
  private isSyncing = false;

  constructor(
    @InjectRepository(AttributeSub)
    private readonly attributesSubRepository: Repository<AttributeSub>,
    @InjectRepository(AttributeMain)
    private readonly attributeMainRepository: Repository<AttributeMain>,
    private readonly erpManager: ErpManager,
  ) {}

  public async sync(): Promise<void> {
    let skip = 0;
    // key = `${mainExtId}-${subTitle}`
    const uniqueSubs = new Map<string, { mainExtId: string; title: string }>();

    // 1) Fetch all products in pages and collect unique main→sub pairs
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

    // 2) Load all existing mains and build a map extId → AttributeMain
    const mains = await this.attributeMainRepository.find();
    const mainsMap = new Map(mains.map(m => [m.extId, m]));

    // 3) Load all existing subs (with their parent relation) and build a map
    const existingSubs = await this.attributesSubRepository.find({ relations: ['attribute'] });
    const existingMap = new Map(
      existingSubs.map(s => [`${s.attribute.extId}-${s.title}`, s])
    );

    // 4) Upsert each unique sub
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
        // create new
        sub = this.attributesSubRepository.create({
          attribute: parent,
          title,
          isPublished: true,
          orden: ordenCounter++,
          productCount: 0,           // or set to 1 if you want a count of rows
        });
      } else {
        // update existing
        sub.title = title;
        sub.orden = ordenCounter++;
        // preserve productCount or adjust as needed
      }

      await this.attributesSubRepository.save(sub);
    }

    this.logger.log(`Synchronized ${uniqueSubs.size} AttributeSub records`);
  }

  /** Runs every minute (Asia/Jerusalem) */
  // @Cron(CronExpression.EVERY_MINUTE, { timeZone: 'Asia/Jerusalem' })
  public async handleCron() {
    if (this.isSyncing) {
      this.logger.log('Previous sync still running — skipping this tick');
      return;
    }
    this.isSyncing = true;
    this.logger.log('Cron job: starting ERP attribute sub sync');

    try {
      await this.sync();
      this.logger.log('Cron job: ERP attribute sub sync completed successfully');
    } catch (error) {
      this.logger.error('Cron job: ERP attribute sub sync failed', (error as Error).stack);
    } finally {
      this.isSyncing = false;
    }
  }
}
