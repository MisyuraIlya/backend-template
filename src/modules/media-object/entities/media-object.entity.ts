import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsOptional, IsString } from 'class-validator';
import { ProductImages } from 'src/modules/product-images/entities/product-image.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { Notification } from 'src/modules/notification/entities/notification.entity';
import { HomeMedia } from 'src/modules/home-media/entities/home-media.entity';

@Entity()
export class MediaObject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  contentUrl: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  filePath: string;

  @ManyToOne(() => Category, (category) => category.mediaObjects, { nullable: true })
  categories: Category;

  @OneToMany(() => ProductImages, (productImages) => productImages.mediaObject)
  productImages: ProductImages[];

  @OneToMany(() => Notification, (notification) => notification.image)
  notifications: Notification[];

  @OneToMany(() => HomeMedia, (homeMedia) => homeMedia.media)
  homeMedia: HomeMedia[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Optionally add custom methods or hooks as needed
}
