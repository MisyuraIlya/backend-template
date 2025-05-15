import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsOptional, IsBoolean, IsInt, IsString } from 'class-validator';
import { HomeMedia } from 'src/modules/home-media/entities/home-media.entity';

@Entity()
export class HomeEdit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  type: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  orden: number;

  @Column()
  @IsBoolean()
  isVideo: boolean;

  @Column()
  @IsBoolean()
  isBanner: boolean;

  @Column()
  @IsBoolean()
  isActive: boolean;

  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  count: number;

  @OneToMany(() => HomeMedia, (homeMedia) => homeMedia.home, { cascade: true })
  homeMedia: HomeMedia[];

  @Column({
    type: 'int',
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  countMobile: number | null;

  @Column()
  @IsBoolean()
  isPopUp: boolean;

  @Column()
  @IsBoolean()
  isDeletable: boolean;
}
