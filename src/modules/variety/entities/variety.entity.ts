import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity()
export class Variety {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.varieties, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Product, (product) => product.varieties, { onDelete: 'CASCADE' })
  sku: Product;

  @Column({ default: true })
  isPublished: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
