import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { STOCK_HANDLER_KEY } from '../decorators/stock-handler.decorator';
import { Product } from 'src/modules/product/entities/product.entity';
import { CartItem } from 'src/modules/history/dto/create-order.dto';
import { ConfigService } from '@nestjs/config';
import { ErpManager } from 'src/erp/erp.manager';

@Injectable()
export class StockInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
    private readonly erpManager: ErpManager,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const apply = this.reflector.get<boolean>(
      STOCK_HANDLER_KEY,
      context.getHandler(),
    );
    if (!apply) return next.handle();

    return next.handle().pipe(
      map(async (items: CartItem[]) => {
        // for (const item of items) {
        //   const product = await this.productRepo.findOne({
        //     where: { sku: item.sku },
        //     select: ['stock'],
        //   });
        //   item.stock = product?.stock ?? 0;
        // }
        return items;
      }),
    );
  }

  private async fetchOnline() {
    
  }

  private async fetchDb() {

  }

  
}
