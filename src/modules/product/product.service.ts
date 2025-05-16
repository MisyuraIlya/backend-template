import { Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttributeMain } from '../attribute-main/entities/attribute-main.entity';

import {
  CatalogResponse,
} from './dto/catalog.dto';
import { ErpManager } from 'src/erp/erp.manager';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ProductService extends TypeOrmCrudService<Product> {
  constructor(
    private readonly erpManager: ErpManager,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(AttributeMain)
    private readonly attributeMainRepo: Repository<AttributeMain>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(productRepo);
  }

  async getCatalog(
    lvl1 = 0,
    lvl2 = 0,
    lvl3 = 0,
    page = 1,
    limit = 20,
    filters: Record<string, string> = {},
  ): Promise<CatalogResponse> {
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.productAttributes', 'pa')
      .leftJoinAndSelect('pa.attributeSub', 's')
      .leftJoinAndSelect('s.attribute', 'm')
      .where('p.isPublished = true')
      .distinct(true);

    [lvl1, lvl2, lvl3].forEach((lvl, i) => {
      if (lvl > 0) {
        qb.andWhere(`p.category_lvl${i + 1}_id = :lvl${i + 1}`, {
          [`lvl${i + 1}`]: lvl,
        });
      }
    });

    const subIds = Object.values(filters)
      .map(v => parseInt(v, 10))
      .filter(v => !isNaN(v));
    subIds.forEach((subId, idx) => {
      qb.innerJoin('p.productAttributes', `fpa${idx}`)
        .innerJoin(
          `fpa${idx}.attributeSub`,
          `fs${idx}`,
          `fs${idx}.id = :sub${idx}`,
          { [`sub${idx}`]: subId },
        );
    });

    qb.skip((page - 1) * limit).take(limit);

    const [products, total] = await qb.getManyAndCount();
    const pageCount = Math.ceil(total / limit);

    const filtersDto = await this.buildFiltersFrom(products);

    return { data: products, size: products.length, total, page, pageCount, filters: filtersDto };
  }

  private async buildFiltersFrom(products: Product[]): Promise<AttributeMain[]> {
    const subSet = new Set(
      products.flatMap(p => p.productAttributes?.map(pa => pa.attributeSub.id) || [])
    );
    if (!subSet.size) return [];

    const mains = await this.attributeMainRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.SubAttributes', 's')
      .where('m.isPublished = true')
      .andWhere('m.isInFilter = true')
      .andWhere('s.id IN (:...ids)', { ids: Array.from(subSet) })
      .orderBy('m.orden', 'ASC')
      .addOrderBy('s.orden', 'ASC')
      .getMany();
    return mains
  }

  public async purchaseHistory(userId: number, productId: number){
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const product = await this.productRepo.findOneBy({id:productId})
    if(!product){
      throw new NotFoundException(`Product with id ${productId} not found`);
    }
    return this.erpManager.PurchaseHistoryByUserAndSku(user?.extId,product.sku)
  }

  public async purchaseDelivery(productId: number){
    const product = await this.productRepo.findOneBy({id:productId})

    if(!product){
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    return this.erpManager.GetPurchaseDelivery(product.sku)
  }

  public async warehouseDetailed(productId: number){
    const product = await this.productRepo.findOneBy({id:productId})

    if(!product){
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    return this.erpManager.GetWarehouseDetailedBySku(product.sku)
  }
}
