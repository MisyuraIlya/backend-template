import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ErpManager } from 'src/erp/erp.manager';
import { Product } from '../product/entities/product.entity';
import { History } from '../history/entities/history.entity';
import { StockInterceptor } from 'src/common/interceptors/stock.interceptor';
import { PriceInterceptor } from 'src/common/interceptors/price.interceptor';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product, History]),
    CacheModule.register({
      ttl: 30,   
      max: 100,  
    }),
  ],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    ErpManager,
    StockInterceptor,
    PriceInterceptor,
  ],
})
export class DocumentModule {}
