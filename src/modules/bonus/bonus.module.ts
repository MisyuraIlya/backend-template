import { Module } from '@nestjs/common';
import { BonusService } from './bonus.service';
import { BonusController } from './bonus.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bonus } from './entities/bonus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bonus]),
  ],
  controllers: [BonusController],
  providers: [BonusService],
})
export class BonusModule {}
