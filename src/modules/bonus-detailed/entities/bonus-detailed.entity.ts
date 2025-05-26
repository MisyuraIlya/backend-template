import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IsOptional, IsInt } from 'class-validator';
import { Bonus } from 'src/modules/bonus/entities/bonus.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity()
export class BonusDetailed {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Bonus, (bonus) => bonus.bonusDetaileds, { onDelete: 'CASCADE' })
  bonus: Bonus;

  @ManyToOne(() => Product, (product) => product.bonusDetaileds, { onDelete: 'CASCADE' })
  product: Product;

  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  minimumQuantity: number;

  @ManyToOne(() => Product, (product) => product.bonusProductDetaildes, { onDelete: 'CASCADE' })
  bonusProduct: Product;

  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  bonusQuantity: number;
}
