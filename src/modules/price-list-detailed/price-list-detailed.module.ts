import { Module } from '@nestjs/common';
import { PriceListDetailedService } from './price-list-detailed.service';
import { PriceListDetailedController } from './price-list-detailed.controller';

@Module({
  controllers: [PriceListDetailedController],
  providers: [PriceListDetailedService],
})
export class PriceListDetailedModule {}
