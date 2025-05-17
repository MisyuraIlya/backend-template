import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { IsOptional, IsString, IsInt, IsBoolean, IsArray } from 'class-validator';
import { Product } from 'src/modules/product/entities/product.entity';
import { MediaObject } from 'src/modules/media-object/entities/media-object.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  @IsString()
  extId: string;

  @Column({ length: 255 })
  @IsString()
  title: string;

  @Column({ length: 255, nullable: true })
  @IsOptional()
  @IsString()
  description: string;

  @Column()
  @IsBoolean()
  isPublished: boolean;

  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  orden: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  lvlNumber: number;

  @ManyToOne(() => Category, (category) => category.categories)
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  categories: Category[];

  @OneToMany(() => Product, (product) => product.categoryLvl1)
  productsLvl1: Product[];

  @OneToMany(() => Product, (product) => product.categoryLvl2)
  productsLvl2: Product[];

  @OneToMany(() => Product, (product) => product.categoryLvl3)
  productsLvl3: Product[];

  @ManyToOne(() => MediaObject, (mediaObject) => mediaObject.categories)
  mediaObject: MediaObject;

  @Column('simple-array', { nullable: true })
  @IsOptional()
  @IsArray()
  integrationGroups: string[];

  @Column({ length: 255, nullable: true })
  @IsOptional()
  @IsString()
  englishTitle: string;

}
