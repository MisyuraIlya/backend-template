import { Controller } from '@nestjs/common';
import { HomeEditService } from './home-edit.service';
import { HomeEdit } from './entities/home-edit.entity';
import { Crud, CrudController } from '@dataui/crud';
import { Public } from 'src/common/decorators/public.decorator';

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
@Public()
@Controller('home-edit')
export class HomeEditController implements CrudController<HomeEdit>{
  constructor(public readonly service: HomeEditService) {}
}
