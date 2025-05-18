import { Controller } from '@nestjs/common';
import { BonusService } from './bonus.service';
import { Crud, CrudController } from '@dataui/crud';
import { Bonus } from './entities/bonus.entity';

@Crud({
  model: { type: Bonus },
  params: {
    id: { field: 'id', type: 'number', primary: true },
  },
  query: {
    join: {
      bonusDetaileds: {
        eager: true,
      },
      'bonusDetaileds.product': {
        eager: true,
      },
      'bonusDetaileds.bonusProduct': {
        eager: true,
      },
    },
  },
})
@Controller('bonus')
export class BonusController implements CrudController<Bonus> {
  constructor(public readonly service: BonusService) {}

  
}
