import { Test, TestingModule } from '@nestjs/testing';
import { ProductPackageService } from './product-package.service';

describe('ProductPackageService', () => {
  let service: ProductPackageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductPackageService],
    }).compile();

    service = module.get<ProductPackageService>(ProductPackageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
