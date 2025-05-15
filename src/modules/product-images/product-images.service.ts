import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { ProductImages } from './entities/product-image.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductImagesService extends TypeOrmCrudService<ProductImages> {
  constructor(
    @InjectRepository(ProductImages)
    repo,
  ) {
    super(repo);
  }
}
