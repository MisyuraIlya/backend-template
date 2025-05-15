import { Controller } from '@nestjs/common';
import { HistoryService } from './history.service';
import { Crud, CrudController } from '@dataui/crud';
import { History } from './entities/history.entity';

@Crud({
  model: { type: History },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
})
@Controller('history')
export class HistoryController implements CrudController<History>{
  constructor(public readonly service: HistoryService) {}

}
