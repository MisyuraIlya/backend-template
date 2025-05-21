import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { AttributeMain } from '../attribute-main/entities/attribute-main.entity';
import { User } from '../user/entities/user.entity';
import { AttributeSub } from '../attribute-sub/entities/attribute-sub.entity';
import { Category } from '../category/entities/category.entity';
import { ProductAttribute } from '../product-attribute/entities/product-attribute.entity';
import { CategoryService } from '../category/category.service';

@Injectable()
export class OfflineService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
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
    return this.productRepo.find();
  }

  async getOfflineAttributeMain(): Promise<AttributeMain[]> {
    return this.attributeMainRepo.find();
  }

  async getOfflineAttributeSub(): Promise<AttributeSub[]> {
    return this.attributeSubRepo.find();
  }

  async getOfflineProductAttribute(): Promise<ProductAttribute[]> {
    return this.productAttributeRepo.find();
  }
}
