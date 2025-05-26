import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PriceList } from 'src/modules/price-list/entities/price-list.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity()
export class PriceListDetailed {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.priceListDetaileds, { onDelete: 'CASCADE' })
  product: Product;

  @Column()
  price: number;

  @Column({ nullable: true })
  discount: number;

  @ManyToOne(() => PriceList, (priceList) => priceList.priceListDetaileds, { onDelete: 'CASCADE' })
  priceList: PriceList;
}
