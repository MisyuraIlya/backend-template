import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cron')
export class Cron {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    jobName: string;

    @Column()
    label: string;

    @Column()
    cronTime: string;

    @Column({ type: 'timestamp', nullable: true })
    lastFetchTime?: Date;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'boolean', default: false })
    status: boolean;

    @Column({ type: 'int', nullable: true })
    duration?: number;
}
