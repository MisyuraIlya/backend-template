import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@dataui/crud';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Crud({
  model: { type: User },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
})
@Controller('user')
export class UserController implements CrudController<User> {
  constructor(public readonly service: UserService) {}
}
