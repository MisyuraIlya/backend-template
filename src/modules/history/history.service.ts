import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { History } from './entities/history.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { CartItem, OrderRequest } from './dto/create-order.dto';
import { HistoryDetailed } from '../history-detailed/entities/history-detailed.entity';
import { ErpManager } from 'src/erp/erp.manager';
import { Product } from '../product/entities/product.entity';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { PurchaseStatus } from './enums/PurchaseStatus';

@Injectable()
export class HistoryService extends TypeOrmCrudService<History> {
  constructor(
    private readonly erpManager: ErpManager,
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
    @InjectRepository(HistoryDetailed)
    private readonly historyDetailedRepository: Repository<HistoryDetailed>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(historyRepository);
  }

  public async createOrder(dto: OrderRequest) {
    // 1. find user
    const user = await this.userRepository.findOneBy({ id: dto.user.id });
    if (!user) {
      throw new NotFoundException(`user with id ${dto.user.id} not found`);
    }

    // 2. find agent (optional)
    const agent = dto.agent?.id
      ? await this.userRepository.findOneBy({ id: dto.agent.id })
      : null;

    // 3. validate everything (throws BadRequestException on error)
    await this.handleValidation(dto, user, agent);

    // 4. persist master record
    const history = await this.createHistory(dto, user, agent);

    // 5. persist line items
    await this.createHistoryDetailed(history, dto.cart);

    // 6. push to ERP and update status
    const orderNumber = await this.handleSendErp(history);

    return {
      status: true,
      data: orderNumber,
      message: 'הזמנה שודרה בהצלחה!',
    };
  }

  private async handleValidation(
    dto: OrderRequest,
    user: User,
    agent: User | null,
  ) {
    if (user.isBlocked) {
      throw new BadRequestException('לקוח חסום');
    }

    if (!dto.deliveryDate) {
      throw new BadRequestException('לא נבחר יום הספקה');
    }

    if (!Array.isArray(dto.cart) || dto.cart.length === 0) {
      throw new BadRequestException('לא נבחר שום מוצר');
    }

    for (const item of dto.cart) {
      const product = await this.productRepository.findOneBy({ sku: item.sku });
      if (!product) {
        throw new BadRequestException(`פריט ${item.sku} לא נמצא`);
      }
      if (!product.isPublished) {
        throw new BadRequestException(
          `פריט ${item.sku} - ${product.title} חסום, ניתן להוריד ולשדר שוב`,
        );
      }
    }
  }

  private async createHistory(
    dto: OrderRequest,
    user: User,
    agent: User | null,
  ): Promise<History> {
    const h = this.historyRepository.create({
      user,
      agent: agent ?? undefined,
      deliveryDate: new Date(dto.deliveryDate),
      discount: dto.discountUser ?? 0,
      total: dto.total,
      orderComment: dto.comment,
      orderStatus: PurchaseStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      deliveryPrice: dto.deliveryPrice ?? 0,
      isBuyByCreditCard: false,
      documentType: dto.documentType,
      isSendErp: false,
      json: JSON.stringify(dto),
      tax: 18, // TODO: calculate dynamically
    });
    return this.historyRepository.save(h);
  }

  private async createHistoryDetailed(
    history: History,
    cart: CartItem[],
  ): Promise<void> {
    for (const element of cart) {
      const product = await this.productRepository.findOneBy({ sku: element.sku });
      if (!product) continue;

      const detail = this.historyDetailedRepository.create({
        history,
        product,
        quantity: element.quantity,
        singlePrice: element.price,
        total: element.total,
      });
      await this.historyDetailedRepository.save(detail);
    }
  }

  private async handleSendErp(history: History): Promise<string> {
    // replace with: const response = await this.erpManager.SendOrder(history);
    const response = await Promise.resolve('123');

    if (response) {
      history.orderExtId = response;
      history.orderStatus = PurchaseStatus.PAID;
      history.isSendErp = true;
    } else {
      history.error = response;
      history.orderStatus = PurchaseStatus.FAILED;
      history.isSendErp = false;
    }

    history.updatedAt = new Date();
    await this.historyRepository.save(history);
    return response
  }
}
