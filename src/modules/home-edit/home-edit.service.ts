import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HomeEdit } from './entities/home-edit.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';

@Injectable()
export class HomeEditService extends TypeOrmCrudService<HomeEdit> {
  constructor(
    @InjectRepository(HomeEdit)
    repo,
  ) {
    super(repo);
  }
}
