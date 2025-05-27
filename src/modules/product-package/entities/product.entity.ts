import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity()
export class ProductPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.productPackages, { onDelete: 'CASCADE' })
  product: Product;

  @Column({ type: 'float', nullable: true })
  quantity: number;

}
