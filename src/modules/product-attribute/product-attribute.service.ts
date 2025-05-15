import { Injectable } from '@nestjs/common';
import { CreateProductAttributeDto } from './dto/create-product-attribute.dto';
import { UpdateProductAttributeDto } from './dto/update-product-attribute.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductAttribute } from './entities/product-attribute.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';

@Injectable()
export class ProductAttributeService extends TypeOrmCrudService<ProductAttribute> {
  constructor(
    @InjectRepository(ProductAttribute)
    repo,
  ) {
    super(repo);
  }
}
