import { Module } from '@nestjs/common';
import { BonusDetailedService } from './bonus-detailed.service';
import { BonusDetailedController } from './bonus-detailed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BonusDetailed } from './entities/bonus-detailed.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BonusDetailed]),
  ],
  controllers: [BonusDetailedController],
  providers: [BonusDetailedService],
})
export class BonusDetailedModule {}
