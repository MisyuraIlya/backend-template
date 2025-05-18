import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PRICE_HANDLER_KEY } from '../decorators/price-handler.decorator';
import { CartItem } from 'src/modules/history/dto/create-order.dto';
import { Product } from 'src/modules/product/entities/product.entity';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/modules/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { ErpManager } from 'src/erp/erp.manager';

@Injectable()
export class PriceInterceptor implements NestInterceptor {
  private readonly isOnline: boolean;
  private user: User | null = null;

  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly erpManager: ErpManager,
  ) {
    this.isOnline = this.config.get<boolean>('IS_ONLINE_PRICE') ?? true;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    return from(this.handleUser(req)).pipe(
      switchMap(() => {
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
      }),
    );
  }

  private async process(items: any): Promise<any> {
    if (this.isCartItems(items)) {
      return this.handleCartItems(items);
    }
    if (this.isCrudResponse(items)) {
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
    const products = items.map(item => item.product);
    const updatedProducts = await this.fetchPriceOnline(products);
    return items.map(item => {
      const upd = updatedProducts.find(p => p.sku === item.sku);
      const product = upd
        ? {
            ...item.product,
            basePrice: upd.basePrice,
            finalPrice: upd.finalPrice,
            discount: upd.discount,
            packQuantity: upd.packQuantity,
          }
        : item.product;

      const price    = upd?.finalPrice   ?? item.price;
      const discount = upd?.discount     ?? item.discount;
      const total    = price * item.quantity - discount;

      return {
        ...item,
        product,
        price,
        discount,
        total,
        choosedPackQuantity: upd?.packQuantity ?? item.choosedPackQuantity,
      };
    });
  }

  private async handleProductList(
    response: { data: Product[]; [key: string]: any },
  ): Promise<{ data: Product[]; [key: string]: any }> {
    const { data: products, ...rest } = response;
    let updatedProducts: Product[];
    if (this.isOnline) {
      updatedProducts = await this.fetchPriceOnline(products);
    } else {
      updatedProducts = await this.fetchPriceDb(products);
    }
    return { ...rest, data: updatedProducts };
  }



  private async fetchPriceDb(products: Product[]): Promise<Product[]> {
    //TODO
    return products;
  }

  private async fetchPriceOnline(products: Product[]): Promise<Product[]> {
    const skus = products.map(p => p.sku);
    const priceLists = this.user?.priceListUsers.map(e => e.priceList.extId) ?? [];
    const response = await this.erpManager.GetPriceOnline(
      this.user?.extId!,
      skus,
      priceLists,
    );
    return products.map(product => {
      product.finalPrice = product.basePrice ?? 0;
      product.discount   = product.discount   ?? 0;

      const skuMatch = response.find(item => item.sku === product.sku);
      if (skuMatch) {
        if (skuMatch.price     != null) product.finalPrice = skuMatch.price;
        if (skuMatch.discount  != null) product.discount   = skuMatch.discount;
        if (skuMatch.basePrice != null) product.basePrice = skuMatch.basePrice;
        return product;
      }

      const groupMatch = response.find(item => item.group === product.group);
      if (groupMatch?.discount != null) {
        product.discount = groupMatch.discount;
      }

      if (product.finalPrice <= 0) {
        product.finalPrice = product.basePrice ?? 0;
      }

      return product;
    });
  }

  private async handleUser(req: Request): Promise<void> {
    const rawId = req.params.userId ?? req.query.userId;
    if (rawId == null) {
      this.user = null;
      return;
    }
    const id = parseInt(rawId as string, 10);
    if (Number.isNaN(id)) {
      throw new BadRequestException(`Invalid userId: "${rawId}"`);
    }
    this.user = await this.userRepository.findOne({
      where: { id },
      relations: ['priceListUsers', 'priceListUsers.priceList'],
    });
  }
}