import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ErpManager } from 'src/erp/erp.manager';
import { AttributeSub } from 'src/modules/attribute-sub/entities/attribute-sub.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { ProductAttribute } from 'src/modules/product-attribute/entities/product-attribute.entity';

@Injectable()
export class GetAttributeProducts {
  private readonly logger = new Logger(GetAttributeProducts.name);
  private readonly PAGE_SIZE = 1000;
  public isSyncing = false;

  constructor(
    @InjectRepository(AttributeSub)
    private readonly attributeSubRepository: Repository<AttributeSub>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductAttribute)
    private readonly productAttributeRepository: Repository<ProductAttribute>,

    private readonly erpManager: ErpManager,
  ) {}

  public async sync(): Promise<void> {
    let skip = 0;

    const subs = await this.attributeSubRepository.find({ relations: ['attribute'] });
    const subsMap = new Map<string, AttributeSub>(
      subs.map(sub => [`${sub.attribute.extId}-${sub.title}`, sub]),
    );

    const existing = await this.productAttributeRepository.find({ relations: ['product', 'attributeSub'] });
    const existingSet = new Set<string>(
      existing.map(pa => `${pa.product.id}-${pa.attributeSub.id}`),
    );

    while (true) {
      this.logger.log(`Fetching ERP products batch (skip=${skip}, top=${this.PAGE_SIZE})`);
      const batch = (await this.erpManager.GetProducts(this.PAGE_SIZE, skip)) ?? [];
      if (!batch.length) {
        this.logger.log('No more products to process for attribute-products');
        break;
      }

      for (const dto of batch) {
        if (!dto || !dto.sku) continue;

        const product = await this.productRepository.findOne({ where: { sku: dto.sku } });
        if (!product) {
          this.logger.warn(`Product not found for sku=${dto.sku}`);
          continue;
        }

        const mappings = [
          { mainId: dto.Extra12!, subTitle: dto.Extra14! },
          { mainId: dto.Extra16!, subTitle: dto.Extra18! },
          { mainId: dto.Extra20!, subTitle: dto.Extra22! },
        ];

        for (const { mainId, subTitle } of mappings) {
          if (!mainId || !subTitle) continue;

          const key = `${mainId}-${subTitle}`;
          const attributeSub = subsMap.get(key);
          if (!attributeSub) {
            this.logger.warn(`AttributeSub not found for key=${key}`);
            continue;
          }

          const relationKey = `${product.id}-${attributeSub.id}`;
          if (existingSet.has(relationKey)) {
            continue;
          }

          const pa = this.productAttributeRepository.create({
            product,
            attributeSub,
          });
          await this.productAttributeRepository.save(pa);
          existingSet.add(relationKey);
          this.logger.log(`Linked product id=${product.id} to sub id=${attributeSub.id}`);
        }
      }

      skip += this.PAGE_SIZE;
    }

    this.logger.log('Synchronization of ProductAttribute relations completed');
  }

  // @Cron(CronExpression.EVERY_MINUTE, { timeZone: 'Asia/Jerusalem' })
  public async handleCron() {
    if (this.isSyncing) {
      this.logger.log('Previous sync still running — skipping this tick');
      return;
    }
    this.isSyncing = true;
    this.logger.log('Cron job: starting ERP attribute-products sync');

    try {
      await this.sync();
      this.logger.log('Cron job: ERP attribute-products sync completed successfully');
    } catch (error) {
      this.logger.error('Cron job: ERP attribute-products sync failed', (error as Error).stack);
    } finally {
      this.isSyncing = false;
    }
  }
}
