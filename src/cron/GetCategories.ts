// src/modules/get-categories/get-categories.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ErpManager } from "src/erp/erp.manager";
import { Category } from "src/modules/category/entities/category.entity";
import { ProductDto } from "src/erp/dto/product.dto";

@Injectable()
export class GetCategoriesService {
  private readonly logger = new Logger(GetCategoriesService.name);
  private readonly PAGE_SIZE = 100;
  private isSyncing = false;

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly erpManager: ErpManager,
  ) {}

  /**
   * Syncs up to 3 levels of categories by fetching one page at a time
   * and saving/updating each category before fetching the next page.
   * Sets proper parent relationships for lvl 2 and lvl 3 categories.
   */
  public async sync(): Promise<void> {
    let skip = 0;

    while (true) {
      this.logger.log(`Fetching ERP products batch (skip=${skip}, top=${this.PAGE_SIZE})`);
      const batch = await this.erpManager.GetProducts(this.PAGE_SIZE, skip);

      if (!batch || batch.length === 0) {
        this.logger.log('No more products to process; sync complete');
        break;
      }

      // Filter out any null/undefined entries
      const validBatch = batch.filter((dto): dto is ProductDto => dto != null);

      for (const dto of validBatch) {
        try {
          // Level 1
          if (dto.categoryLvl1Id && dto.categoryLvl1Name) {
            let cat1 = await this.categoryRepository.findOne({
              where: { extId: dto.categoryLvl1Id, lvlNumber: 1 },
            });
            if (!cat1) {
              cat1 = new Category();
              cat1.extId = dto.categoryLvl1Id;
              cat1.lvlNumber = 1;
              cat1.isPublished = true;
            }
            cat1.title = dto.categoryLvl1Name;
            await this.categoryRepository.save(cat1);

            // Level 2
            let cat2: Category | null = null;
            if (dto.categoryLvl2Id && dto.categoryLvl2Name) {
              cat2 = await this.categoryRepository.findOne({
                where: { extId: dto.categoryLvl2Id, lvlNumber: 2 },
              });
              if (!cat2) {
                cat2 = new Category();
                cat2.extId = dto.categoryLvl2Id;
                cat2.lvlNumber = 2;
                cat2.isPublished = true;
                cat2.parent = cat1;
              }
              cat2.title = dto.categoryLvl2Name;
              cat2.parent = cat1;
              await this.categoryRepository.save(cat2);
            }

            // Level 3
            if (dto.categoryLvl3Id && dto.categoryLvl3Name) {
              let cat3 = await this.categoryRepository.findOne({
                where: { extId: dto.categoryLvl3Id, lvlNumber: 3 },
              });
              if (!cat3) {
                cat3 = new Category();
                cat3.extId = dto.categoryLvl3Id;
                cat3.lvlNumber = 3;
                cat3.isPublished = true;
                // parent of lvl3 is lvl2 if exists, otherwise lvl1
                cat3.parent = cat2 ?? cat1;
              }
              cat3.title = dto.categoryLvl3Name;
              cat3.parent = cat2 ?? cat1;
              await this.categoryRepository.save(cat3);
            }
          }
        } catch (err) {
          this.logger.error(
            `Failed to process product DTO ${JSON.stringify(dto)}`,
            (err as Error).stack,
          );
          // continue on to the next DTO
        }
      }

      skip += this.PAGE_SIZE;
    }
  }

  /** Runs every minute (Asia/Jerusalem) */
//   @Cron(CronExpression.EVERY_MINUTE, { timeZone: 'Asia/Jerusalem' })
  public async handleCron() {
    if (this.isSyncing) {
      this.logger.log('Previous sync still running — skipping this tick');
      return;
    }
    this.isSyncing = true;
    this.logger.log('Cron job: starting ERP categories sync');

    try {
      await this.sync();
      this.logger.log('Cron job: ERP categories sync completed successfully');
    } catch (error) {
      this.logger.error(
        'Cron job: ERP categories sync failed',
        (error as Error).stack,
      );
    } finally {
      this.isSyncing = false;
    }
  }
}
