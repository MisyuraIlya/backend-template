import { Injectable } from '@nestjs/common';
import { CreateMediaObjectDto } from './dto/create-media-object.dto';
import { UpdateMediaObjectDto } from './dto/update-media-object.dto';

@Injectable()
export class MediaObjectService {
  create(createMediaObjectDto: CreateMediaObjectDto) {
    return 'This action adds a new mediaObject';
  }

  findAll() {
    return `This action returns all mediaObject`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mediaObject`;
  }

  update(id: number, updateMediaObjectDto: UpdateMediaObjectDto) {
    return `This action updates a #${id} mediaObject`;
  }

  remove(id: number) {
    return `This action removes a #${id} mediaObject`;
  }
}
