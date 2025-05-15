import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { IsOptional, IsString } from 'class-validator';
import { HomeEdit } from 'src/modules/home-edit/entities/home-edit.entity';
import { MediaObject } from 'src/modules/media-object/entities/media-object.entity';

@Entity()

export class HomeMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MediaObject, (media) => media.homeMedia, { cascade: true })
  media: MediaObject;

  @ManyToOne(() => HomeEdit, (homeEdit) => homeEdit.homeMedia)
  home: HomeEdit;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  device: string;

}
