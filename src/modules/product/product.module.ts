import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { AttributeMain } from '../attribute-main/entities/attribute-main.entity';
import { ErpManager } from 'src/erp/erp.manager';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product,AttributeMain,User]),
  ],
  controllers: [ProductController],
  providers: [ProductService, ErpManager],
})
export class ProductModule {}
