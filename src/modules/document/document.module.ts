import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ErpManager } from 'src/erp/erp.manager';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product]),
  ],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    ErpManager
  ],
})
export class DocumentModule {}
