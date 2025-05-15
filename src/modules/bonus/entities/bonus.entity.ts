import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsOptional, IsString, IsDate } from 'class-validator';
import { BonusDetailed } from 'src/modules/bonus-detailed/entities/bonus-detailed.entity';

@Entity()
export class Bonus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: true })
  @IsOptional()
  @IsString()
  userExtId: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsDate()
  createdAt: Date;

  @Column({ nullable: true })
  @IsOptional()
  @IsDate()
  expiredAt: Date;

  @Column({ length: 255, nullable: true })
  @IsOptional()
  @IsString()
  title: string;

  @Column({ length: 255, nullable: true })
  @IsOptional()
  @IsString()
  extId: string;

  @OneToMany(() => BonusDetailed, (bonusDetailed) => bonusDetailed.bonus)
  bonusDetaileds: BonusDetailed[];
}
