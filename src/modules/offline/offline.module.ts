import { Module } from '@nestjs/common';
import { OfflineService } from './offline.service';
import { OfflineController } from './offline.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { AttributeMain } from '../attribute-main/entities/attribute-main.entity';
import { AttributeSub } from '../attribute-sub/entities/attribute-sub.entity';
import { ProductAttribute } from '../product-attribute/entities/product-attribute.entity';
import { User } from '../user/entities/user.entity';
import { CategoryModule } from '../category/category.module';
import { ErpManager } from 'src/erp/erp.manager';


@Module({
  imports: [
    TypeOrmModule.forFeature([Product,AttributeMain,AttributeSub,ProductAttribute,User]),
    CategoryModule,
  ],
  controllers: [OfflineController],
  providers: [OfflineService, ErpManager],
})
export class OfflineModule {}
