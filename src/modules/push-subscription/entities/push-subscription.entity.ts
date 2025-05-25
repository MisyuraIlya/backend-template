import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { User } from '../../user/entities/user.entity';
  
  @Entity()
  export class PushSubscription {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    endpoint: string;
  
    @Column('text')
    p256dh: string;
  
    @Column('text')
    auth: string;
  
    @ManyToOne(() => User, (user) => user.pushSubscriptions, { onDelete: 'CASCADE' })
    user: User;
  
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;
  }
  