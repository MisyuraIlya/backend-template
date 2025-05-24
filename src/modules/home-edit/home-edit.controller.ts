import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { HomeEditService } from './home-edit.service';
import { HomeEdit } from './entities/home-edit.entity';
import { Crud, CrudController } from '@dataui/crud';
import { Public } from 'src/common/decorators/public.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Crud({
  model: { type: HomeEdit },
  params: {
    id: { field: 'id', type: 'number', primary: true },
  },
  query: {
    join: {
      homeMedia: {
        alias: 'media',
        eager: true,
      },
      'homeMedia.mediaObject': {
        alias: 'obj',
        eager: true,
      },
    },
    sort: [{ field: 'orden', order: 'ASC' }],
  },
})
@Public()
@Controller('home-edit')
@UseInterceptors(CacheInterceptor) 
export class HomeEditController implements CrudController<HomeEdit>{
  constructor(public readonly service: HomeEditService) {}

  @Post('drag-and-drop')
  async dragAndDrop(
    @Body() items: HomeEdit[],
  ): Promise<HomeEdit[]> {
    return this.service.updateOrder(items);
  }
}
