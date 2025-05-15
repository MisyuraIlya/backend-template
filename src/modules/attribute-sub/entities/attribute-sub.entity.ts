import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';
import { AttributeMain } from 'src/modules/attribute-main/entities/attribute-main.entity';
import { ProductAttribute } from 'src/modules/product-attribute/entities/product-attribute.entity'; 

@Entity()
export class AttributeSub {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AttributeMain, (attributeMain) => attributeMain.SubAttributes)
  attribute: AttributeMain;

  @Column({ length: 255, nullable: true })
  @IsOptional()
  @IsString()
  title: string;

  @OneToMany(() => ProductAttribute, (productAttribute) => productAttribute.attributeSub)
  productAttributes: ProductAttribute[];

  @Column()
  @IsOptional()
  productCount: number;

  @Column()
  @IsBoolean()
  isPublished: boolean;

  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  orden: number;
}
