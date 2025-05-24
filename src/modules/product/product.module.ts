import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { AttributeMain } from '../attribute-main/entities/attribute-main.entity';
import { ErpManager } from 'src/erp/erp.manager';
import { User } from '../user/entities/user.entity';
import { StockInterceptor } from 'src/common/interceptors/stock.interceptor';
import { PriceInterceptor } from 'src/common/interceptors/price.interceptor';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product,AttributeMain,User]),
    CacheModule.register({
      ttl: 30,    
      max: 200,   
    }),
  ],
  controllers: [ProductController],
  providers: [
    ProductService, 
    ErpManager,
    StockInterceptor,
    PriceInterceptor,
  ],
})
export class ProductModule {}
