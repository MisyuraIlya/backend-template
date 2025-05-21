import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErpManager } from 'src/erp/erp.manager';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { History } from '../history/entities/history.entity';
import { DocumentDto, DocumentsDto } from 'src/erp/dto/documents.dto';
import { DocumentItemDto, DocumentItemFileDto, DocumentItemsDto } from 'src/erp/dto/documentItems.dto';
import { CartItem } from '../history/dto/create-order.dto';
import { CartCheckDto } from './dto/cart-check.dto';
import { UsersTypes } from '../user/enums/UsersTypes';

@Injectable()
export class DocumentService {

  private readonly PAGE_SIZE = 20;
  private readonly HISTORY_TYPES = ['history', 'draft', 'approve', 'offline'];

  constructor(
    private readonly erpManager: ErpManager,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ){}

  async getDocuments(
    documentType: string,
    dateFrom: Date,
    dateTo: Date,
    page = 1,
    userId: number | null,
  ): Promise<DocumentsDto> {
    if (userId === null) {
      throw new NotFoundException(
        `Must supply userId when fetching local history`,
      );
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (this.HISTORY_TYPES.includes(documentType.toLowerCase())) {
      const qb = this.historyRepository
        .createQueryBuilder('h')
        .leftJoinAndSelect('h.user', 'user')
        .leftJoinAndSelect('h.agent', 'agent')
        .leftJoinAndSelect('h.agentApproved', 'agentApproved')
        .where('h.createdAt BETWEEN :from AND :to', { from: dateFrom, to: dateTo });

      if (![
        UsersTypes.AGENT,
        UsersTypes.ADMIN,
        UsersTypes.SUPER_AGENT,
      ].includes(user.role)) {
        qb.andWhere('user.id = :uid', { uid: userId });
      }

      if (documentType.toLowerCase() !== 'history') {
        qb.andWhere('h.documentType = :type', { type: documentType });
      }

      const [records, total] = await qb
        .orderBy('h.createdAt', 'DESC')
        .skip((page - 1) * this.PAGE_SIZE)
        .take(this.PAGE_SIZE)
        .getManyAndCount();

      const documents: DocumentDto[] = records.map(h => ({
        id:             h.id.toString(),
        documentNumber: h.orderExtId,
        documentType:   h.documentType,
        userName:       h.user?.name,
        userExId:       h.user?.extId,
        agentExId:      h.agent?.extId,
        agentName:      h.agent?.name,
        status:         h.orderStatus?.toString(),
        createdAt:      h.createdAt.toISOString(),
        updatedAt:      h.updatedAt.toISOString(),
        dueDateAt:      h.deliveryDate,
        total:          h.total,
        user:           h.user,
        error:          h.error ?? null,
      }));

      return {
        documents,
        total,
        pageCount: Math.ceil(total / this.PAGE_SIZE),
        page,
        size:      this.PAGE_SIZE,
      };
    }

    const extIdToSend: string | null = [
      UsersTypes.AGENT,
      UsersTypes.ADMIN,
      UsersTypes.SUPER_AGENT,
    ].includes(user.role)
      ? null
      : user.extId;

    const response = await this.erpManager.GetDocuments(
      dateFrom,
      dateTo,
      documentType,
      this.PAGE_SIZE,
      page,
      extIdToSend,
    );

    if (response?.documents) {
      await Promise.all(
        response.documents.map(async element => {
          if (!element.userExId) return;

          const user = await this.userRepository.findOneBy({ extId: element.userExId });
          if (user) {
            element.user = user;
          }
        }),
      );
    }

    return response;
  }

  async getDocumentItems(
    documentType: string,
    documentNumber: string,
  ): Promise<DocumentItemsDto> {
    const lower = documentType.toLowerCase();

    if (this.HISTORY_TYPES.includes(lower)) {
      const history = await this.historyRepository.findOne({
        where: {
          id: +documentNumber,
        },
        relations: [
          'historyDetaileds',
          'historyDetaileds.product',
        ],
      });
      if (!history) {
        throw new NotFoundException(
          `No local history found for document ${documentNumber}`,
        );
      }

      const products: DocumentItemDto[] = history.historyDetaileds.map((d) => ({
        sku:         d.product?.sku,
        title:       d.product?.title,           
        quantity:    d.quantity  ?? 0,
        priceByOne:  d.singlePrice ?? 0,
        total:       d.total     ?? 0,
        discount:    d.discount  ?? 0,
        comment:     null,                       
        product:     d.product  ?? null,
      }));

      const totalPreDiscount = products.reduce((sum, p) => sum + p.total, 0);
      const totalAfterDiscount = products.reduce(
        (sum, p) => sum + (p.total - p.discount),
        0,
      );
      const totalTax = history.tax;
      const totalPriceAfterTax = totalAfterDiscount * (1 + history.tax / 100);

      const dto: DocumentItemsDto = {
        products,
        totalTax,
        totalPriceAfterTax,
        totalAfterDiscount,
        totalPrecent: history.discount,
        documentType: history.documentType,
        comment:      history.orderComment ?? null,
        base64Pdf:    null,
        files:        [] as DocumentItemFileDto[], 
      };

      return dto;
    }

    const erp = await this.erpManager.GetDocumentsItem(
      documentNumber,
      documentType,
    );
    if (erp?.products) {
      await Promise.all(
        erp.products.map(async (item) => {
          item.product = (await this.productRepository.findOneBy({
            sku: item.sku,
          })) || null;
        }),
      );
    }
    return erp;
  }
  
  async getCartesset(
    dateFrom: Date,
    dateTo: Date,
    userId: number 
  ) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const response = await this.erpManager.GetCartesset(user?.extId,dateFrom, dateTo);
    return response;
  }

  async getDebit(
    dateFrom: Date,
    dateTo: Date,
    userId: number 
  ) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const response = await this.erpManager.GetDebit(user?.extId,dateFrom, dateTo);
    return response;
  }

  async restoreCart(
    documentType: string,
    userId: number,
    documentNumber: string
  ): Promise<CartItem[]> {
    const lower = documentType.toLowerCase();
  
    if (this.HISTORY_TYPES.includes(lower)) {
      const history = await this.historyRepository.findOne({
        where: { id: +documentNumber },
        relations: ['historyDetaileds', 'historyDetaileds.product'],
      });
      if (!history) {
        throw new NotFoundException(
          `No local history found for document ${documentNumber}`,
        );
      }
  
      const products: CartItem[] = history.historyDetaileds
        .filter(d => d.product?.isPublished)
        .map((d) => ({
          sku:                 d.product!.sku,
          quantity:            d.quantity ?? 0,
          product:             d.product!,
          stock:               0,
          price:               0,
          discount:            d.product?.discount ?? 0,
          comment:             '',
          total:               0,
          isBonus:             false,
          choosedPackQuantity: 0,
        }));
  
      return products;
    }
  
    const response = await this.getDocumentItems(documentType, documentNumber);
    const items: CartItem[] = [];
    for (const d of response.products || []) {
      const product = await this.productRepository.findOneBy({ sku: d.sku });
      if (!product?.isPublished) continue;
      items.push({
        sku:                 product.sku,
        quantity:            d.quantity ?? 0,
        product,
        stock:               0,
        price:               0,
        discount:            product.discount ?? 0,
        comment:             '',
        total:               0,
        isBonus:             false,
        choosedPackQuantity: 0,
      });
    }
  
    return items;
  }

  async checkCart(dto: CartCheckDto) {
    const user = await this.userRepository.findOneBy({id:dto.user.id})
    return { maam: 18, }
  }
  
}
