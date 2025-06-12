import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cron_settings')
export class CronSettings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cronTime: string;
    
    @Column()
    isActive: boolean;
}
