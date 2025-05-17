import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AttributeMainService } from './attribute-main.service';
import { Crud, CrudController } from '@dataui/crud';
import { AttributeMain } from './entities/attribute-main.entity';

@Crud({
  model: { type: AttributeMain },
  params: {
    id: { field: 'id', type: 'number', primary: true },
  },
  query: {
    join: {
      SubAttributes: {
        eager: true,
      },
    },
  },
})
@Controller('attribute-main')
export class AttributeMainController implements CrudController<AttributeMain>{
  constructor(public readonly service: AttributeMainService) {}

}
