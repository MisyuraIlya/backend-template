import { Module } from '@nestjs/common';
import { SalesKeeperService } from './sales-keeper.service';
import { SalesKeeperController } from './sales-keeper.controller';

@Module({
  controllers: [SalesKeeperController],
  providers: [SalesKeeperService],
})
export class SalesKeeperModule {}
