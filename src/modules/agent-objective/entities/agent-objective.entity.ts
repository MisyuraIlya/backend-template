import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { IsOptional, IsString, IsBoolean, IsDate } from 'class-validator';
import { User } from 'src/modules/user/entities/user.entity';
import { AgentObjectiveType } from '../enums/AgentObjectiveType';

@Entity()
export class AgentObjective {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.agentObjectives)
  agent: User;

  @ManyToOne(() => User, (user) => user.clientObjectives)
  client: User;

  @Column()
  @IsBoolean()
  isCompleted: boolean;

  @Column({ nullable: true })
  @IsOptional()
  @IsDate()
  completedAt: Date;

  @Column({ length: 255, nullable: true })
  @IsOptional()
  @IsString()
  title: string;

  @Column({ length: 255, nullable: true })
  @IsOptional()
  @IsString()
  description: string;

  @Column()
  @IsBoolean()
  week1: boolean;

  @Column()
  @IsBoolean()
  week2: boolean;

  @Column()
  @IsBoolean()
  week3: boolean;

  @Column()
  @IsBoolean()
  week4: boolean;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hourFrom: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  hourTo: string;

  @Column({ length: 255, nullable: true })
  @IsOptional()
  @IsString()
  choosedDay: string;

  @Column('date', { nullable: false })
  @IsDate()
  date: Date;

  @Column()
  @IsDate()
  createdAt: Date;

  @Column()
  @IsDate()
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: AgentObjectiveType,
    nullable: true,
  })
  objectiveType: AgentObjectiveType;

  @OneToMany(() => AgentObjective, (subtask) => subtask.agent)
  subTusk: AgentObjective[];
}
