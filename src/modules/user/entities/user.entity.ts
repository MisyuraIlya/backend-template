import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { IsEmail, IsOptional } from 'class-validator';
import { History } from 'src/modules/history/entities/history.entity';
import { Variety } from 'src/modules/variety/entities/variety.entity';
import { AgentTarget } from 'src/modules/agent-target/entities/agent-target.entity';
import { AgentObjective } from 'src/modules/agent-objective/entities/agent-objective.entity';
import { PriceListUser } from 'src/modules/price-list-user/entities/price-list-user.entity';
import { NotificationUser } from 'src/modules/notification-user/entities/notification-user.entity';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { UsersTypes } from '../enums/UsersTypes';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  @IsEmail()
  @IsOptional()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  isRegistered: boolean;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  extId: string;

  @Column({default:false})
  isBlocked: boolean;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column({ nullable: true })
  recovery: string;

  @OneToMany(() => History, (history) => history.user)
  histories: History[];

  @OneToMany(() => Variety, (variety) => variety.user)
  varieties: Variety[];

  @OneToMany(() => AgentTarget, (agentTarget) => agentTarget.agent)
  agentTargets: AgentTarget[];

  @OneToMany(() => AgentObjective, (agentObjective) => agentObjective.agent)
  agentObjectives: AgentObjective[];

  @OneToMany(() => AgentObjective, (agentObjective) => agentObjective.client)
  clientObjectives: AgentObjective[];

  @Column({
    type: 'enum',
    enum: UsersTypes,
    nullable: true,
  })
  role: UsersTypes; 

  @Column({ nullable: true })
  passwordUnencrypted: string;

  @Column({ default: false })
  isAllowOrder: boolean;

  @Column({ default: false })
  isAllowAllClients: boolean;

  @OneToMany(() => PriceListUser, (priceListUser) => priceListUser.user)
  priceListUsers: PriceListUser[];

  @Column({ nullable: true })
  payCode: string;

  @Column({ nullable: true })
  PayDes: string;

  @Column({ nullable: true })
  maxCredit: number;

  @Column({ nullable: true })
  maxObligo: number;

  @Column({ nullable: true })
  hp: string;

  @Column({ nullable: true })
  taxCode: string;

  @ManyToOne(() => User, { nullable: true })
  parent: User;

  @OneToMany(() => User, (user) => user.parent)
  users: User[];

  @ManyToOne(() => User, { nullable: true })
  agent: User;

  @OneToMany(() => User, (user) => user.agent)
  usersAgent: User[];

  @Column()
  isAgent: boolean;

  @OneToMany(() => NotificationUser, (notificationUser) => notificationUser.user)
  notificationUsers: NotificationUser[];

  @Column({ nullable: true })
  search: string;

  @Column({ nullable: true })
  oneSignalAppId: string;

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  address: string;

  @Column({default:true})
  isVatEnabled: boolean;

  @Column({ nullable: true })
  salesCurrency: string;

  @OneToMany(() => History, (history) => history.agent)
  agentHistories: History[];

  @OneToMany(() => History, (history) => history.agentApproved)
  approvedHistories: History[];
}
