import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MediaObject } from 'src/modules/media-object/entities/media-object.entity';
import { NotificationUser } from 'src/modules/notification-user/entities/notification-user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  link: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column()
  isSend: boolean;

  @ManyToOne(() => MediaObject, (mediaObject) => mediaObject.notifications, { nullable: true, onDelete: 'CASCADE' })
  mediaObject: MediaObject;

  @Column()
  isPublic: boolean;

  @Column()
  isPublished: boolean;

  @OneToMany(() => NotificationUser, (notificationUser) => notificationUser.notification)
  notificationUsers: NotificationUser[];

  @Column()
  isSystem: boolean;

}
