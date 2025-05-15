import { Module } from '@nestjs/common';
import { HistoryDetailedService } from './history-detailed.service';
import { HistoryDetailedController } from './history-detailed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryDetailed } from './entities/history-detailed.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HistoryDetailed]),
  ],
  controllers: [HistoryDetailedController],
  providers: [HistoryDetailedService],
})
export class HistoryDetailedModule {}
