import { Injectable } from '@nestjs/common';
import { CreatePriceListDetailedDto } from './dto/create-price-list-detailed.dto';
import { UpdatePriceListDetailedDto } from './dto/update-price-list-detailed.dto';

@Injectable()
export class PriceListDetailedService {
  create(createPriceListDetailedDto: CreatePriceListDetailedDto) {
    return 'This action adds a new priceListDetailed';
  }

  findAll() {
    return `This action returns all priceListDetailed`;
  }

  findOne(id: number) {
    return `This action returns a #${id} priceListDetailed`;
  }

  update(id: number, updatePriceListDetailedDto: UpdatePriceListDetailedDto) {
    return `This action updates a #${id} priceListDetailed`;
  }

  remove(id: number) {
    return `This action removes a #${id} priceListDetailed`;
  }
}
