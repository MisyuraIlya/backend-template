import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ErpManager } from "src/erp/erp.manager";
import { Product } from "src/modules/product/entities/product.entity";
import { Category } from "src/modules/category/entities/category.entity";
import { ProductDto } from "src/erp/dto/product.dto";
import { ProductPackage } from "src/modules/product-package/entities/product.entity";

@Injectable()
export class GetProductsService {
  private readonly logger = new Logger(GetProductsService.name);
  private readonly PAGE_SIZE = 100;
  public isSyncing = false;

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(ProductPackage)
    private readonly productPackageRepository: Repository<ProductPackage>,
    private readonly erpManager: ErpManager,
  ) {}

  public async sync(): Promise<void> {
    let skip = 0;

    while (true) {
      this.logger.log(`Fetching ERP products batch (skip=${skip}, top=${this.PAGE_SIZE})`);
      const batch = await this.erpManager.GetProducts(this.PAGE_SIZE, skip) ?? [];
      if (!batch.length) {
        this.logger.log('No more products to process; sync complete');
        break;
      }
      for (const dto of batch) {
        if (!dto) {
          continue;
        }
        if (!dto.sku) {
          continue;
        }

        try {
          let prod = await this.productRepository.findOne({ where: { sku: dto.sku } });
          if (!prod) {
            prod = this.productRepository.create({ sku: dto.sku });
          }

          prod.title        = dto.title!;
          prod.titleEnglish = null;
          prod.description  = dto.description ?? prod.description;
          prod.barcode      = dto.barcode ?? prod.barcode;
          prod.packQuantity = dto.packQuantity ?? prod.packQuantity;
          prod.basePrice    = dto.baseprice != null ? Number(dto.baseprice) : prod.basePrice;
          prod.finalPrice   = dto.minimumPrice ?? prod.finalPrice;
          prod.isPublished  = dto.status;

          prod.isNew     = dto.isHumane ?? prod.isNew;
          prod.isSpecial = dto.isDrugNotInBasket ?? prod.isSpecial;

          if (dto.categoryLvl1Id) {
            const cat1 = await this.categoryRepository.findOne({
              where: { extId: dto.categoryLvl1Id, lvlNumber: 1 },
            });
            if (cat1) prod.categoryLvl1 = cat1;
          }
          if (dto.categoryLvl2Id) {
            const cat2 = await this.categoryRepository.findOne({
              where: { extId: dto.categoryLvl2Id, lvlNumber: 2 },
            });
            if (cat2) prod.categoryLvl2 = cat2;
          }
          if (dto.categoryLvl3Id) {
            const cat3 = await this.categoryRepository.findOne({
              where: { extId: dto.categoryLvl3Id, lvlNumber: 3 },
            });
            if (cat3) prod.categoryLvl3 = cat3;
          }

          if(dto?.packages && dto?.packages?.length > 0){  
            dto.packages?.forEach(async (item) => {
              let packageEntity = await this.productPackageRepository.findOne({
                where: {
                  product: prod,
                  quantity: item.quantity
                }
              })
              if(!packageEntity){
                packageEntity = new ProductPackage()
                packageEntity.product = prod
                packageEntity.quantity = item.quantity
                this.productPackageRepository.save(packageEntity)
              }
           
            })
          }

          await this.productRepository.save(prod);
        } catch (err) {
          const error = err as Error;
          this.logger.error(
            `Failed to process product DTO ${JSON.stringify(dto)} — ${error.message}`,
            error.stack,
          );
        }
      }

      skip += this.PAGE_SIZE;
    }
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
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }
}
