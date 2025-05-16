import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
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

  @Get(':documentType/:mode/:lvl1/:lvl2/:lvl3')
  async getCatalog(
    @Param('lvl1', ParseIntPipe) lvl1: number,
    @Param('lvl2', ParseIntPipe) lvl2: number,
    @Param('lvl3', ParseIntPipe) lvl3: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('itemsPerPage', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query() query: Record<string, any>,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    const filters: Record<string, string> = {};
    Object.entries(query).forEach(([key, val]) => {
      const match = key.match(/^filter\[(\d+)\]$/);
      if (match && typeof val === 'string') {
        filters[match[1]] = val;
      }
    });

    return this.service.getCatalog(
      lvl1,
      lvl2,
      lvl3,
      page,
      limit,
      filters,  
    );
  }

  @Get('purchaseHistory/:userId/:productId')
  async purchaseHistory(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.service.purchaseHistory(+userId,+productId)
  }

  @Get('purchaseDelivery/:productId')
  async purchaseDelivery(
    @Param('productId') productId: string,
  ) {
    return this.service.purchaseDelivery(+productId)
  }

  @Get('warehouseDetailed/:productId')
  async warehouseDetailed(
    @Param('productId') productId: string,
  ) {
    return this.service.warehouseDetailed(+productId)
  }


}
