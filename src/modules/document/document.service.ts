import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErpManager } from 'src/erp/erp.manager';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class DocumentService {
  constructor(
    private readonly erpManager: ErpManager,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ){}

  async getDocuments(
    documentType: string,
    dateFrom: Date,
    dateTo: Date,
    page: number,
    userId: number | null 
  ){
    let user: User | null = null;

    if (userId !== null) {
      user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }
    }
    const response = this.erpManager.GetDocuments(dateFrom,dateTo,documentType,20,page,user?.extId)
    return response
  }

  async getDocumentItems(
    documentType: string,
    documentNumber: string
  ) {
    const response = await this.erpManager.GetDocumentsItem(documentNumber, documentType);
    if (response?.products) {
      await Promise.all(
        response.products.map(async (item) => {
          const product = await this.productRepository.findOneBy({ sku: item.sku });
          item.product = product;
        })
      );
    }
    return response;
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
}
