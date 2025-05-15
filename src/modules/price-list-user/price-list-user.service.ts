import { Injectable } from '@nestjs/common';
import { CreatePriceListUserDto } from './dto/create-price-list-user.dto';
import { UpdatePriceListUserDto } from './dto/update-price-list-user.dto';

@Injectable()
export class PriceListUserService {
  create(createPriceListUserDto: CreatePriceListUserDto) {
    return 'This action adds a new priceListUser';
  }

  findAll() {
    return `This action returns all priceListUser`;
  }

  findOne(id: number) {
    return `This action returns a #${id} priceListUser`;
  }

  update(id: number, updatePriceListUserDto: UpdatePriceListUserDto) {
    return `This action updates a #${id} priceListUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} priceListUser`;
  }
}
