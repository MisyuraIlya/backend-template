import { Injectable } from '@nestjs/common';
import { NotificationUser } from './entities/notification-user.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NotificationUserService extends TypeOrmCrudService<NotificationUser> {
  constructor(
    @InjectRepository(NotificationUser)
    repo,
  ) {
    super(repo);
  }
}
