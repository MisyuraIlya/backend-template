import { Controller } from '@nestjs/common';
import { ProductImagesService } from './product-images.service';
import { Crud, CrudController } from '@dataui/crud';
import { ProductImages } from './entities/product-image.entity';

@Crud({
  model: { type: ProductImages },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
})
@Controller('product-images')
export class ProductImagesController implements CrudController<ProductImages>  {
  constructor(public readonly service: ProductImagesService) {}


}
