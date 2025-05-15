import { Controller } from '@nestjs/common';
import { HomeEditService } from './home-edit.service';
import { HomeEdit } from './entities/home-edit.entity';
import { Crud, CrudController } from '@dataui/crud';

@Crud({
  model: { type: HomeEdit },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
})
@Controller('home-edit')
export class HomeEditController implements CrudController<HomeEdit>{
  constructor(public readonly service: HomeEditService) {}
}
