import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ErpManager } from "src/erp/erp.manager";
import { Category } from "src/modules/category/entities/category.entity";
import { CategoryDto } from "src/erp/dto/category.dto";

@Injectable()
export class GetCategoriesService {
  private readonly logger = new Logger(GetCategoriesService.name);
  public isSyncing = false;

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly erpManager: ErpManager,
  ) {}


  public async sync(): Promise<void> {
    const data = await this.erpManager.GetCategories();
    data?.forEach(async (element: CategoryDto) => {
      if(element?.categoryId){
        let category = await this.categoryRepository.findOne({
          where: { extId: element.categoryId },
        })
        if(!category){
          category = new Category();
          category.extId = element.categoryId;
        }
        category.title = element.categoryName || '';
        category.englishTitle = element.englishCategoryName || '';
        category.isPublished =  true;
        category.lvlNumber = element.lvlNumber || 0;
        if(element.parentId){
          const parentCategory = await this.categoryRepository.findOne({
            where: { extId: element.parentId },
          });
          if (parentCategory) {
            category.parent = parentCategory;
          } 
        }
        this.categoryRepository.save(category)
      }

    });

  }

  public async handleCron(): Promise<void> {
    if (this.isSyncing) {
      this.logger.log({
        context: GetCategoriesService.name,
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
        context: GetCategoriesService.name,
        level: 'info',
        message: `Cron job: ERP categories sync completed successfully in ${durationMs}ms`,
        CRON_SUCCEEDED: true,
        durationMs,
      });
    } catch (err) {
      const durationMs = Date.now() - start;
      this.logger.error({
        context: GetCategoriesService.name,
        message: `Cron job: ERP categories sync failed after ${durationMs}ms`,
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
