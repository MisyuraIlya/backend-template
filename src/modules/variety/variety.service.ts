import { Injectable } from '@nestjs/common';
import { CreateVarietyDto } from './dto/create-variety.dto';
import { UpdateVarietyDto } from './dto/update-variety.dto';

@Injectable()
export class VarietyService {
  create(createVarietyDto: CreateVarietyDto) {
    return 'This action adds a new variety';
  }

  findAll() {
    return `This action returns all variety`;
  }

  findOne(id: number) {
    return `This action returns a #${id} variety`;
  }

  update(id: number, updateVarietyDto: UpdateVarietyDto) {
    return `This action updates a #${id} variety`;
  }

  remove(id: number) {
    return `This action removes a #${id} variety`;
  }
}
