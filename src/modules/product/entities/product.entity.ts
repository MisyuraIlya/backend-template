import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  IsArray,
} from 'class-validator';
import { Category } from 'src/modules/category/entities/category.entity';
import { ProductImages } from 'src/modules/product-images/entities/product-image.entity';
import { Variety } from 'src/modules/variety/entities/variety.entity';
import { PriceListDetailed } from 'src/modules/price-list-detailed/entities/price-list-detailed.entity';
import { ProductAttribute } from 'src/modules/product-attribute/entities/product-attribute.entity';
import { BonusDetailed } from 'src/modules/bonus-detailed/entities/bonus-detailed.entity';
import { HistoryDetailed } from 'src/modules/history-detailed/entities/history-detailed.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable:true })
  @IsString()
  sku: string;

  @Column({ type: 'varchar', length: 255, nullable:true })
  @IsString()
  group: string;

  @Column({ type: 'varchar', length: 255, nullable:true })
  @IsString()
  title: string;

  @Column({ type: 'varchar', length: 255, nullable:true })
  @IsString()
  search: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  titleEnglish: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  defaultImagePath: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  remoteDefaultImagePath: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  barcode: string | null;

  @Column({ default: true })
  @IsBoolean()
  isPublished: boolean;

  @ManyToOne(() => Category, (category) => category.productsLvl1, { onDelete: 'CASCADE' })
  categoryLvl1: Category;

  @ManyToOne(() => Category, (category) => category.productsLvl2, { onDelete: 'CASCADE' })
  categoryLvl2: Category;

  @ManyToOne(() => Category, (category) => category.productsLvl3, { onDelete: 'CASCADE' })
  categoryLvl3: Category;

  @OneToMany(() => ProductImages, (image) => image.product)
  productImages: ProductImages[];

  @OneToMany(() => Variety, (variety) => variety.sku)
  varieties: Variety[];

  @OneToMany(
    () => PriceListDetailed,
    (priceList) => priceList.product,
  )
  priceListDetaileds: PriceListDetailed[];

  @OneToMany(
    () => HistoryDetailed,
    (historyDetailed) => historyDetailed.product,
  )
  historyDetaileds: HistoryDetailed[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'float', nullable: true })
  @IsOptional()
  @IsInt()
  basePrice: number | null;

  @Column({ type: 'float', nullable: true, default: 0 })
  @IsOptional()
  @IsInt()
  finalPrice: number | null;

  @Column({ type: 'int', default: 0 })
  @IsInt()
  stock: number;

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsInt()
  packQuantity: number | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  @IsOptional()
  @IsInt()
  discount: number | null;

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  @IsInt()
  orden: number | null;

  @OneToMany(
    () => ProductAttribute,
    (attribute) => attribute.product,
  )
  productAttributes: ProductAttribute[];

  @Column({ default: false })
  @IsBoolean()
  isNew: boolean;

  @Column({ default: false })
  @IsBoolean()
  isSpecial: boolean;

  @OneToMany(
    () => BonusDetailed,
    (bonus) => bonus.product,
  )
  bonusDetaileds: BonusDetailed[];

  @OneToMany(
    () => BonusDetailed,
    (bonusProduct) => bonusProduct.bonusProduct,
  )
  bonusProductDetaildes: BonusDetailed[];

  @Column('simple-array', { nullable: true })
  @IsOptional()
  @IsArray()
  multiCategory: string[] | null;
}
