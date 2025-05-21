import { Module } from '@nestjs/common';
import { OfflineService } from './offline.service';
import { OfflineController } from './offline.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { AttributeMain } from '../attribute-main/entities/attribute-main.entity';
import { AttributeSub } from '../attribute-sub/entities/attribute-sub.entity';
import { ProductAttribute } from '../product-attribute/entities/product-attribute.entity';
import { User } from '../user/entities/user.entity';
import { CategoryModule } from '../category/category.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Product,Category,AttributeMain,AttributeSub,ProductAttribute,User]),
    CategoryModule
  ],
  controllers: [OfflineController],
  providers: [OfflineService],
})
export class OfflineModule {}
