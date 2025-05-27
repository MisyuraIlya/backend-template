import { Test, TestingModule } from '@nestjs/testing';
import { ProductPackageController } from './product-package.controller';
import { ProductPackageService } from './product-package.service';

describe('ProductPackageController', () => {
  let controller: ProductPackageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductPackageController],
      providers: [ProductPackageService],
    }).compile();

    controller = module.get<ProductPackageController>(ProductPackageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
