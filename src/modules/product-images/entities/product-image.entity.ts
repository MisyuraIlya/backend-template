import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Product } from 'src/modules/product/entities/product.entity';
import { MediaObject } from 'src/modules/media-object/entities/media-object.entity';

@Entity()
export class ProductImages {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.productImages, { onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => MediaObject, (mediaObject) => mediaObject.productImages, { onDelete: 'CASCADE' })
  mediaObject: MediaObject;

}
