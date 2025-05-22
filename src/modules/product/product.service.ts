import { Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
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
    search?: string,
  ): Promise<CatalogResponse> {
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.categoryLvl1', 'cat1')
      .leftJoinAndSelect('p.categoryLvl2', 'cat2')
      .leftJoinAndSelect('p.categoryLvl3', 'cat3')
      .leftJoinAndSelect('p.productAttributes', 'pa')
      .leftJoinAndSelect('pa.attributeSub', 's')
      .leftJoinAndSelect('s.attribute', 'm')
      .leftJoinAndSelect('p.productImages', 'img')
      .leftJoinAndSelect('img.mediaObject', 'mo')
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
      .filter(n => !isNaN(n));
    subIds.forEach((subId, idx) => {
      qb.innerJoin('p.productAttributes', `fpa${idx}`)
        .innerJoin(
          `fpa${idx}.attributeSub`,
          `fs${idx}`,
          `fs${idx}.id = :sub${idx}`,
          { [`sub${idx}`]: subId },
        );
    });

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      qb.andWhere(
        new Brackets(q => {
          q.where('p.sku LIKE :term', { term })
           .orWhere('p.title LIKE :term', { term })
           .orWhere('p.titleEnglish LIKE :term', { term });
        }),
      );
    }

    qb.orderBy('p.orden', 'ASC');
    qb.skip((page - 1) * limit).take(limit);

    const [products, total] = await qb.getManyAndCount();
    const pageCount = Math.ceil(total / limit);

    await this.handleStock(products);
    const filtersDto = await this.buildFiltersFrom(products);

    return {
      data: products,
      size: products.length,
      total,
      page,
      pageCount,
      filters: filtersDto,
    };
  }

  async getAdminProducts(
    lvl1: number,
    lvl2: number,
    lvl3: number,
  ): Promise<Product[]> {
    let filterLevel: 1 | 2 | 3 | null = null;
    let filterId: number | null = null;

    if (lvl3 > 0) {
      filterLevel = 3;
      filterId = lvl3;
    } else if (lvl2 > 0) {
      filterLevel = 2;
      filterId = lvl2;
    } else if (lvl1 > 0) {
      filterLevel = 1;
      filterId = lvl1;
    }

    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.categoryLvl1', 'c1')
      .leftJoinAndSelect('p.categoryLvl2', 'c2')
      .leftJoinAndSelect('p.categoryLvl3', 'c3')
      .leftJoinAndSelect('p.productImages', 'img')
      .leftJoinAndSelect('img.mediaObject', 'mo')
      .where('p.isPublished = true');

    if (filterLevel && filterId) {
      qb.andWhere(`p.category_lvl${filterLevel}_id = :id`, { id: filterId });
    }
    qb.orderBy('p.orden', 'ASC');

    qb.orderBy('p.orden', 'ASC');

    return qb.getMany();
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

  private async handleStock(products: Product[]) {
    products?.forEach((item) => {
      item.stock = 9999
    })
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

  async reorder(items: { id?: number; orden: number }[]): Promise<Product[]> {
    const toUpdate = items.filter(item => typeof item.id === 'number');

    await Promise.all(
      toUpdate.map(item =>
        this.repo
          .createQueryBuilder()
          .update(Product)
          .set({ orden: item.orden })
          .where('id = :id', { id: item.id })
          .execute(),
      ),
    );

    return this.repo.find({
      order: { orden: 'ASC' },
    });
  }
}
