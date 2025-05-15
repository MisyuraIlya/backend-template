import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PriceListDetailed } from 'src/modules/price-list-detailed/entities/price-list-detailed.entity';
import { PriceListUser } from 'src/modules/price-list-user/entities/price-list-user.entity';

@Entity()
export class PriceList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  extId: string;

  @Column({ length: 255, nullable: true })
  title: string;

  @Column({ nullable: true })
  discount: number;

  @OneToMany(() => PriceListDetailed, (priceListDetailed) => priceListDetailed.priceList, { cascade: true })
  priceListDetaileds: PriceListDetailed[];

  @OneToMany(() => PriceListUser, (priceListUser) => priceListUser.priceList, { cascade: true })
  priceListUsers: PriceListUser[];

}
