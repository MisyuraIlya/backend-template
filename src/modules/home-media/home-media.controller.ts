import { Controller } from '@nestjs/common';
import { HomeMediaService } from './home-media.service';
import { Crud, CrudController } from '@dataui/crud';
import { HomeMedia } from './entities/home-media.entity';

@Crud({
  model: { type: HomeMedia },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
  query: {
    join: {
      mediaObject: {
        eager: true,
      },
    },
  },
})
@Controller('home-media')
export class HomeMediaController implements CrudController<HomeMedia> {
  constructor(public readonly service: HomeMediaService) {}


}
