import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { CronModule } from 'src/cron/cron.module';

@Module({
  imports: [CronModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
