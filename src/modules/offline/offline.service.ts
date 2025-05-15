import { Injectable } from '@nestjs/common';
import { CreateOfflineDto } from './dto/create-offline.dto';
import { UpdateOfflineDto } from './dto/update-offline.dto';

@Injectable()
export class OfflineService {
  create(createOfflineDto: CreateOfflineDto) {
    return 'This action adds a new offline';
  }

  findAll() {
    return `This action returns all offline`;
  }

  findOne(id: number) {
    return `This action returns a #${id} offline`;
  }

  update(id: number, updateOfflineDto: UpdateOfflineDto) {
    return `This action updates a #${id} offline`;
  }

  remove(id: number) {
    return `This action removes a #${id} offline`;
  }
}
