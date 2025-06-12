import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CronSettings } from './entities/cron-settings.entity';
import { CreateCronSettingsDto } from './dto/create-cron-settings.dto';
import { UpdateCronSettingsDto } from './dto/update-cron-settings.dto';
import { CronService } from './cron.service';

@Injectable()
export class CronSettingsService {
  constructor(
    @InjectRepository(CronSettings)
    private readonly cronSettingsRepo: Repository<CronSettings>,
    private readonly cronService: CronService,
  ) {}

  async getAll(): Promise<CronSettings[]> {
    return this.cronSettingsRepo.find();
  }

  async create(dto: CreateCronSettingsDto): Promise<CronSettings> {
    const ent = this.cronSettingsRepo.create(dto);
    const saved = await this.cronSettingsRepo.save(ent);
    // Schedule or unschedule right away
    this.cronService.updateSchedule(saved.cronTime, saved.isActive);
    return saved;
  }

  async update(id: number, dto: UpdateCronSettingsDto): Promise<CronSettings> {
    const ent = await this.cronSettingsRepo.findOneByOrFail({ id });
    if (dto.cronTime !== undefined) ent.cronTime = dto.cronTime;
    if (dto.isActive !== undefined) ent.isActive = dto.isActive;
    const saved = await this.cronSettingsRepo.save(ent);
    this.cronService.updateSchedule(saved.cronTime, saved.isActive);
    return saved;
  }
}
