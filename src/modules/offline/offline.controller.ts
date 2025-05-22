import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { OfflineService } from './offline.service';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { Product } from '../product/entities/product.entity';
import { AttributeMain } from '../attribute-main/entities/attribute-main.entity';
import { ProductAttribute } from '../product-attribute/entities/product-attribute.entity';
import { AttributeSub } from '../attribute-sub/entities/attribute-sub.entity';
import { CreateOfflineDto } from './dto/create-offline.dto';
import { StockHandler } from 'src/common/decorators/stock-handler.decorator';
import { PriceHandler } from 'src/common/decorators/price-handler.decorator';
import { PriceInterceptor } from 'src/common/interceptors/price.interceptor';

@Controller('offline')
@UseInterceptors(PriceInterceptor)
export class OfflineController {
  constructor(private readonly offlineService: OfflineService) {}

  @Get('export/user')
  async getOfflineUsers(): Promise<User[]> {
    return this.offlineService.getOfflineUsers();
  }

  @Get('export/category')
  async getOfflineCategories(): Promise<Category[]> {
    return this.offlineService.getOfflineCategories();
  }

  @Get('export/product')
  async getOfflineProducts(): Promise<Product[]> {
    return this.offlineService.getOfflineProducts();
  }

  @Get('export/attribute-main')
  async getOfflineAttributeMain(): Promise<AttributeMain[]> {
    return this.offlineService.getOfflineAttributeMain();
  }

  @Get('export/attribute-sub')
  async getOfflineAttributeSub(): Promise<AttributeSub[]> {
    return this.offlineService.getOfflineAttributeSub();
  }

  @Get('export/product-attribute')
  async getOfflineProductAttribute(): Promise<ProductAttribute[]> {
    return this.offlineService.getOfflineProductAttribute();
  }

  @Post('handlePrice')
  @StockHandler()
  @PriceHandler()
  async handlePrice(@Body() dto: CreateOfflineDto) {
    return this.offlineService.handlePrice(dto)
  }

  @Post('sendOrder') 
  async sendOrder(@Body() dto: CreateOfflineDto) {

  }


}
