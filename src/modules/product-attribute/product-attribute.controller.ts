import { Controller } from '@nestjs/common';
import { ProductAttributeService } from './product-attribute.service';
import { Crud, CrudController } from '@dataui/crud';
import { ProductAttribute } from './entities/product-attribute.entity';

@Crud({
  model: { type: ProductAttribute },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
})
@Controller('product-attribute')
export class ProductAttributeController implements CrudController<ProductAttribute> {
  constructor(public readonly service: ProductAttributeService) {}


}
