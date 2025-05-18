import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, switchMap, from, Observable } from 'rxjs';
import { PRICE_HANDLER_KEY } from '../decorators/price-handler.decorator';
import { CartItem } from 'src/modules/history/dto/create-order.dto';
import { Product } from 'src/modules/product/entities/product.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PriceInterceptor implements NestInterceptor {

  private readonly isOnline: boolean;
  
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {
    this.isOnline = this.config.get<boolean>('IS_ONLINE_PRICE') ?? true;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const req = context.switchToHttp().getRequest<Request>();
    // @ts-ignore
    console.log('req',req.query.userId)
    // const userIdFromQuery = req?.query.userId;     // => '782' (string)
    // const userIdFromParam = req?.params.userId;     // => also works
    // const userId = Number(userIdFromQuery);        // parse if you need a number
    // console.log('current userId:', userId);

    const apply = this.reflector.get<boolean>(
      PRICE_HANDLER_KEY,
      context.getHandler(),
    );
    if (!apply) {
      return next.handle();
    }

    return next.handle().pipe(
      switchMap(items => from(this.process(items)))
    );
  }

  private async process(items: any): Promise<any> {
    if (this.isCartItems(items)) {
      console.log('cart items')
      return this.handleCartItems(items);
    } else if (this.isCrudResponse(items)) {
      console.log('product items')
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

  private async handleCartItems(items: CartItem[]): Promise<CartItem[]> {
    return Promise.all(items.map(async item => {
      const price = await this.fetchPrice(item.product.id);
      item.price = price;
      item.total = price * item.quantity;
      return item;
    }));
  }

  private async handleProductList(response: {
    data: Product[];
    [key: string]: any;
  }): Promise<typeof response> {
 

    const skus = response.data?.map((item) => item.sku)
    console.log('skus',skus)
    const data = await Promise.all(response.data.map(async prod => {
      const price = await this.fetchPrice(prod.id);
      prod.finalPrice = price;
      return prod;
    }));
    return { ...response, data };
  }

  private async fetchPrice(productId: number): Promise<number> {
    return /* …your logic… */ 123;
  }

  private async fetchPriceDb() {

  }

  private async fetchPriceOnline() {

  }
}
