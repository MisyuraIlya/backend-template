import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { IsOptional, IsInt, IsString } from 'class-validator';
import { History } from 'src/modules/history/entities/history.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity()
export class HistoryDetailed {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => History, (history) => history.historyDetaileds)
  history: History;

  @ManyToOne(() => Product, (product) => product.historyDetaileds, { cascade: true })
  product: Product;

  @Column({ nullable: true })
  @IsOptional()
  singlePrice: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  quantity: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  discount: number;

  @Column({ nullable: true })
  @IsOptional()
  total: number;
}
