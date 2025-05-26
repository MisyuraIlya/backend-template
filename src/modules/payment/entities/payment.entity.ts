import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToMany } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { History } from 'src/modules/history/entities/history.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.payments, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'text', nullable: true })
  json: string;

  @Column({ length: 255, nullable: true })
  token: string;

  @Column({ nullable: true })
  amount: number;

  @Column({ length: 255, nullable: true })
  yaadAcCode: string;

  @Column({ type: 'text', nullable: true })
  jsonJ5: string;

  @Column({ length: 255, nullable: true })
  j5Id: string;

  @OneToMany(() => History, (history) => history.payment)
  histories: History[];

}
