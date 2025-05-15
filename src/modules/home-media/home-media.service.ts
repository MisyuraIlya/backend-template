import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { HomeMedia } from './entities/home-media.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class HomeMediaService extends TypeOrmCrudService<HomeMedia>  {
  constructor(
    @InjectRepository(HomeMedia)
    repo,
  ) {
    super(repo);
  }
}
