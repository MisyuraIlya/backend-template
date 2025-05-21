import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from './entities/history.entity';
import { HistoryDetailed } from '../history-detailed/entities/history-detailed.entity';
import { Product } from '../product/entities/product.entity';
import { User } from '../user/entities/user.entity';

import { HistoryService }      from './history.service';
import { HistoryController }   from './history.controller';
import { ErpManager }          from 'src/erp/erp.manager';
import { SupportModule }       from '../support/support.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([History, HistoryDetailed, Product, User]),
    SupportModule,               
    NotificationModule
  ],
  controllers: [HistoryController],
  providers: [HistoryService, ErpManager],
})
export class HistoryModule {}
