import { Injectable } from '@nestjs/common';
import { CreateSalesKeeperDto } from './dto/create-sales-keeper.dto';
import { UpdateSalesKeeperDto } from './dto/update-sales-keeper.dto';

@Injectable()
export class SalesKeeperService {
  create(createSalesKeeperDto: CreateSalesKeeperDto) {
    return 'This action adds a new salesKeeper';
  }

  findAll() {
    return `This action returns all salesKeeper`;
  }

  findOne(id: number) {
    return `This action returns a #${id} salesKeeper`;
  }

  update(id: number, updateSalesKeeperDto: UpdateSalesKeeperDto) {
    return `This action updates a #${id} salesKeeper`;
  }

  remove(id: number) {
    return `This action removes a #${id} salesKeeper`;
  }
}
