import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { PriceList } from 'src/modules/price-list/entities/price-list.entity';

@Entity()
export class PriceListUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.priceListUsers, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => PriceList, (priceList) => priceList.priceListUsers, { onDelete: 'CASCADE' })
  priceList: PriceList;

  @Column({ nullable: true })
  expiredAt: Date;

}
