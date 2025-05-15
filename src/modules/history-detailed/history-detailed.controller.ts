import { Controller } from '@nestjs/common';
import { HistoryDetailedService } from './history-detailed.service';
import { Crud, CrudController } from '@dataui/crud';
import { HistoryDetailed } from './entities/history-detailed.entity';

@Crud({
  model: { type: HistoryDetailed },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
})
@Controller('history-detailed')
export class HistoryDetailedController implements CrudController<HistoryDetailed>{
  constructor(public readonly service: HistoryDetailedService) {}
}
