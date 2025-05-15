import { Controller } from '@nestjs/common';
import { ProductService } from './product.service';
import { Crud, CrudController } from '@dataui/crud';
import { Product } from './entities/product.entity';

@Crud({
  model: { type: Product },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
})
@Controller('product')
export class ProductController implements CrudController<Product> {
  constructor(public readonly service: ProductService) {}

}
