import { Body, Controller, Post } from '@nestjs/common';
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
  query: {
    sort: [{ field: 'orden', order: 'ASC' }],
  },
})
@Controller('attribute-sub')
export class AttributeSubController implements CrudController<AttributeSub> {
  constructor(public readonly service: AttributeSubService) {}

  @Post('drag-and-drop')
  async dragAndDrop(
    @Body() items: AttributeSub[],
  ): Promise<AttributeSub[]> {
    return this.service.dragAndDrop(items);
  }
}
