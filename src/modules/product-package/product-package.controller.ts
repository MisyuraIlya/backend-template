import { Controller } from '@nestjs/common';
import { ProductPackageService } from './product-package.service';

@Controller('product-package')
export class ProductPackageController {
  constructor(private readonly productPackageService: ProductPackageService) {}
}
