import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { from, Observable, switchMap } from 'rxjs';
import { STOCK_HANDLER_KEY } from '../decorators/stock-handler.decorator';
import { Product } from 'src/modules/product/entities/product.entity';
import { CartItem } from 'src/modules/history/dto/create-order.dto';
import { ErpManager } from 'src/erp/erp.manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StockInterceptor implements NestInterceptor {
  private readonly isOnline: boolean;

  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
    private readonly erpManager: ErpManager,
  ) {
    this.isOnline = this.config.get<boolean>('IS_STOCK_ONLINE') ?? true;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const apply = this.reflector.get<boolean>(
      STOCK_HANDLER_KEY,
      context.getHandler(),
    );
    if (!apply) return next.handle();

    return next.handle().pipe(
      switchMap(items => from(this.process(items)))
    );
  }

  private async process(items: any): Promise<any> {
    if (this.isCartItems(items)) {
      return this.handleCartItems(items);
    } else if (this.isCrudResponse(items)) {
      return this.handleProductList(items);
    }
    return items;
  }

  private isCartItems(x: any): x is CartItem[] {
    return Array.isArray(x)
      && x.length > 0
      && 'sku' in x[0]
      && 'quantity' in x[0]
      && 'product' in x[0];
  }

  private isCrudResponse(x: any): x is { data: Product[] } {
    return x !== null
      && typeof x === 'object'
      && Array.isArray(x.data);
  }

  private async handleProductList(
    response: { data: Product[]; [key: string]: any },
  ) {
    if (this.isOnline) {
      await this.handleStockOnline(response.data);
    }
    return {
      ...response,           
      data: response.data,   
    };
  }

  private async handleStockOnline(products: Product[]) {
    const skus = products?.map((item) => item.sku)
    const response = await this.erpManager.GetStockOnline(skus)
    products?.forEach((item) => {
      const stock = response.find((x) => x.sku == item.sku)
      item.stock = stock?.stock ?? 0
    })
    return products
  }

  private async handleCartItems(items: CartItem[]): Promise<CartItem[]> {
    const skus = items?.map((item) => item.sku)
    const updatedProducts = await this.erpManager.GetStockOnline(skus);
    if(this.isOnline){
      items?.forEach((item) => {
        const stock = updatedProducts.find((x) => x.sku === item.sku)
        item.stock = stock?.stock ?? 0
        item.product.stock = stock?.stock ?? 0 
      })
    }
    return items
  }


  
}
