import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Product } from 'src/modules/product/entities/product.entity';
import { AttributeSub } from 'src/modules/attribute-sub/entities/attribute-sub.entity';

@Entity()
export class ProductAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.productAttributes, { onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => AttributeSub, (attributeSub) => attributeSub.productAttributes, { onDelete: 'CASCADE' })
  attributeSub: AttributeSub;

}
