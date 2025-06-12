import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cron')
export class Cron {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    jobName: string;

    @Column()
    label: string;

    @Column({ type: 'int', default: 0 })
    order: number;

    @Column({ type: 'timestamp', nullable: true })
    lastFetchTime?: Date;

    @Column({ type: 'boolean', default: false })
    status: boolean;

    @Column({ type: 'int', nullable: true })
    duration?: number;

    @Column({ type: 'text', nullable: true })
    error: string | null;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'boolean', default: true })
    isPublished: boolean;
}
