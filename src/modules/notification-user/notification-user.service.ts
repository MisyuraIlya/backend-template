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

  async findByFilters(
    userId?: number,
    isRead?: boolean,
  ): Promise<NotificationUser[]> {
    const where: any = {};

    if (userId != null) {
      where.user = { id: userId };
    }
    if (isRead != null) {
      where.isRead = isRead;
    }

    return this.repo.find({
      where,
      relations: ['user', 'notification'],
      order: { createdAt: 'DESC' },
    });
  }
}
