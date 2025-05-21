import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { History } from '../history/entities/history.entity';
import { Repository } from 'typeorm';
import { NotificationUser } from '../notification-user/entities/notification-user.entity';
import { User } from '../user/entities/user.entity';
import { UsersTypes } from '../user/enums/UsersTypes';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService extends TypeOrmCrudService<Notification> {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository,
    @InjectRepository(NotificationUser)
    private notificationUserRepository: Repository<NotificationUser>,
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(notificationRepository);
  }

  async handleOrderNotification(history: History) {

    const notification = this.notificationRepository.create({
      createdAt: new Date(),
      title: 'הזמנה חדשה',
      description: `הזמנה חדשה התקבלה מ${history.user.name} מספר ${history.orderExtId}`,
      isPublic: true,
      isPublished: true,
      isSystem: true,
      isSend: true,
    });
    const savedNotification = await this.notificationRepository.save(notification);

    const user = await this.userRepository.findOne({
      where: { id: history.user.id },
      relations: ['agent'],
    });

    const agentId = user?.agent?.id

    const allowUsers = await this.userRepository.find({
      where: [
        { role: UsersTypes.SUPER_AGENT },
        ...(agentId ? [{ id: agentId }] : []),
        { id: history.user.id },             
      ],
    });

    await Promise.all(
      allowUsers.map(user =>
        this.notificationUserRepository.save(
          this.notificationUserRepository.create({
            createdAt: new Date(),
            isRead: false,
            user,
            notification: savedNotification,
          })
        )
      )
    );
  }

  async sendNotification(dto: CreateNotificationDto) {
    if (dto.who === 'allAgents') {
      const notification = await this.notificationRepository.findOneOrFail({
        where: { id: dto.notificationId },
      });

      const agents = await this.userRepository.find({
        where: { role: UsersTypes.SUPER_AGENT },
      });

      await Promise.all(
        agents.map(agent =>
          this.notificationUserRepository.save(
            this.notificationUserRepository.create({
              isRead: false,
              user: agent,
              notification,      
            })
          )
        )
      );
    }

    if (dto.who === 'allUsers') {
      const notification = await this.notificationRepository.findOneOrFail({
        where: { id: dto.notificationId },
      });

      const users = await this.userRepository.find({
        where: { role: UsersTypes.USER },
      });

      await Promise.all(
        users.map(user =>
          this.notificationUserRepository.save(
            this.notificationUserRepository.create({
              isRead: false,
              user,
              notification,
            })
          )
        )
      );
    }
    return { status: true, message: 'Notification sent successfully' };
  }


}
