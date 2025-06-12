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
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }
}
