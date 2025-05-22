import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { AttributeMain } from '../attribute-main/entities/attribute-main.entity';
import { User } from '../user/entities/user.entity';
import { AttributeSub } from '../attribute-sub/entities/attribute-sub.entity';
import { Category } from '../category/entities/category.entity';
import { ProductAttribute } from '../product-attribute/entities/product-attribute.entity';
import { CategoryService } from '../category/category.service';
import { CreateOfflineDto } from './dto/create-offline.dto';
import { ErpManager } from 'src/erp/erp.manager';
import { CartItem } from '../history/dto/create-order.dto';

@Injectable()
export class OfflineService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(AttributeMain)
    private readonly attributeMainRepo: Repository<AttributeMain>,
    @InjectRepository(AttributeSub)
    private readonly attributeSubRepo: Repository<AttributeSub>,
    @InjectRepository(ProductAttribute)
    private readonly productAttributeRepo: Repository<ProductAttribute>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly categoryService: CategoryService,
  ) {}

  async getOfflineUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getOfflineCategories(): Promise<Category[]> {
    return this.categoryService.getCategoriesApp();
  }

  async getOfflineProducts(): Promise<Product[]> {
    return this.productRepo.find({
      relations: [
        'categoryLvl1',
        'categoryLvl2',
        'categoryLvl3',
        'productAttributes',
        'productAttributes.attributeSub',
        'productAttributes.attributeSub.attribute'
      ],
    });
  }

  async getOfflineAttributeMain(): Promise<AttributeMain[]> {
    return this.attributeMainRepo.find({
      relations: [
        'SubAttributes',
      ],
    });
  }

  async getOfflineAttributeSub(): Promise<AttributeSub[]> {
    return this.attributeSubRepo.find();
  }

  async getOfflineProductAttribute(): Promise<ProductAttribute[]> {
    return this.productAttributeRepo.find({
      relations: [
        'product',
        'attributeSub'
      ],
    });
  }

  async handlePrice(dto: CreateOfflineDto, userId: number): Promise<CartItem[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if(!user){
      throw new NotFoundException(`User with ${userId} not found`);
    }
    const itemsDto = Array.isArray(dto.historyDetailed)
      ? dto.historyDetailed
      : [dto.historyDetailed];

    const cartItems: CartItem[] = [];
    for (const itemDto of itemsDto) {
      const product = await this.productRepo.findOne({
        where: { sku: itemDto.sku },
      });
      if (!product) {
        throw new NotFoundException(`Product with SKU ${itemDto.sku} not found`);
      }
      cartItems.push({
        sku: itemDto.sku,
        quantity: itemDto.quantity,
        product,
        stock: 0,
        price: 0,
        discount: 0,
        isBonus: false,
        comment: itemDto.comment ?? '',
        total: 0,
        choosedPackQuantity: product.packQuantity ?? 1,
      });
    }
    return cartItems;
  }
}
