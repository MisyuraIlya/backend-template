import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';
import { User } from 'src/modules/user/entities/user.entity';
@Entity()
export class AgentTarget {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.agentTargets, { onDelete: 'CASCADE' })
  agent: User;

  @Column({ length: 255, nullable: true })
  @IsOptional()
  @IsString()
  month: string;

  @Column({ length: 255, nullable: true })
  @IsOptional()
  @IsString()
  year: string;

  @Column()
  @IsInt()
  currentValue: number;

  @Column()
  @IsInt()
  targetValue: number;

  @Column()
  @IsBoolean()
  isCompleted: boolean;
}
