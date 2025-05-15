import { Module } from '@nestjs/common';
import { OfflineService } from './offline.service';
import { OfflineController } from './offline.controller';

@Module({
  controllers: [OfflineController],
  providers: [OfflineService],
})
export class OfflineModule {}
