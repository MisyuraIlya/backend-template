import { Controller } from '@nestjs/common';
import { BonusDetailedService } from './bonus-detailed.service';
import { Crud, CrudController } from '@dataui/crud';
import { BonusDetailed } from './entities/bonus-detailed.entity';

@Crud({
  model: { type: BonusDetailed },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
})
@Controller('bonus-detailed')
export class BonusDetailedController implements CrudController<BonusDetailed> {
  constructor(public readonly service: BonusDetailedService) {}

}
