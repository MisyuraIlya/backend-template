import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@dataui/crud';
import { AttributeSub } from './entities/attribute-sub.entity';
import { AttributeSubService } from './attribute-sub.service';

@Crud({
  model: { type: AttributeSub },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
})
@Controller('attribute-sub')
export class AttributeSubController implements CrudController<AttributeSub> {
  constructor(public readonly service: AttributeSubService) {}

}
