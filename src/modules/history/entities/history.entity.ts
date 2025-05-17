import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { IsOptional, IsInt, IsBoolean, IsString, IsDate } from 'class-validator';
import { User } from 'src/modules/user/entities/user.entity';
import { HistoryDetailed } from 'src/modules/history-detailed/entities/history-detailed.entity';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { PurchaseStatus } from '../enums/PurchaseStatus';

@Entity()
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: true })
  @IsOptional()
  @IsString()
  orderExtId: string;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  deliveryDate: Date;

  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  discount: number;

  @Column({ nullable: true })
  @IsOptional()
  total: number;

  @Column({ length: 255, nullable: true })
  @IsOptional()
  @IsString()
  orderComment: string;

  @Column({
    type: 'enum',
    enum: PurchaseStatus,
    nullable: true,
  })
  @IsOptional()
  orderStatus: PurchaseStatus;

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  deliveryPrice: number;

  @Column({ length: 255 })
  documentType: string;

  @Column()
  @IsBoolean()
  isBuyByCreditCard: boolean;

  @Column()
  @IsBoolean()
  isSendErp: boolean;

  @Column({ nullable: true })
  @IsOptional()
  @IsDate()
  sendErpAt: Date;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  json: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  error: string;

  @Column()
  tax: number;

  @Column({ length: 255, nullable: true })
  @IsOptional()
  @IsString()
  deliveryType: string;

  @OneToMany(() => HistoryDetailed, (historyDetailed) => historyDetailed.history)
  historyDetaileds: HistoryDetailed[];

  @ManyToOne(() => User, (user) => user.agentHistories)
  agent: User;

  @ManyToOne(() => User, (user) => user.approvedHistories)
  agentApproved: User;

  @ManyToOne(() => User, (user) => user.histories)
  user: User;

  @ManyToOne(() => Payment, (payment) => payment.histories)
  payment: Payment;

}
