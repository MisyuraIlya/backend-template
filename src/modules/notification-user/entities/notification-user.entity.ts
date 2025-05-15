import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Notification } from 'src/modules/notification/entities/notification.entity';

@Entity()
export class NotificationUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.notificationUsers)
  user: User;

  @ManyToOne(() => Notification, (notification) => notification.notificationUsers)
  notification: Notification;

  @Column()
  isRead: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

}
