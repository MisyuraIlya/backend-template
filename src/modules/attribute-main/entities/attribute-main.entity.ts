import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';
import { AttributeSub } from 'src/modules/attribute-sub/entities/attribute-sub.entity';

@Entity()
export class AttributeMain {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: true })
  @IsOptional()
  @IsString()
  extId: string;

  @Column({ length: 255, nullable: true })
  @IsOptional()
  @IsString()
  title: string;

  @Column()
  @IsBoolean()
  isPublished: boolean;

  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  orden: number;

  @Column()
  @IsBoolean()
  isInProductCard: boolean;

  @Column()
  @IsBoolean()
  isInFilter: boolean;

  @OneToMany(() => AttributeSub, (subAttribute) => subAttribute.attribute)
  SubAttributes: AttributeSub[];

}
