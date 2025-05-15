import { Module } from '@nestjs/common';
import { PriceListUserService } from './price-list-user.service';
import { PriceListUserController } from './price-list-user.controller';

@Module({
  controllers: [PriceListUserController],
  providers: [PriceListUserService],
})
export class PriceListUserModule {}
