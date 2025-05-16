import { Controller, Get, Param, Query } from '@nestjs/common';
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

  @Get('userProfile/:userId')
    async getUserProfile(
      @Param('userId') userId: string,
    ) {
      return this.service.getUserProfile(+userId)
  }

  @Get('salesKeeper/:userId')
    async getSalesKeeper(
      @Param('userId') userId: string,
    ) {
      return this.service.getSalesKeeper(+userId)
  }

  @Get('quantityKeeper/:userId')
    async getQuantityKeeper(
      @Param('userId') userId: string,
    ) {
      return this.service.getQuantityKeeper(+userId)
  }

  @Get('agentClients/:userId')
  async getAgentClient(
    @Param('userId') userId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('status') status?: 'active' | 'inactive',
  ) {
    return this.service.getAgentClients(userId, { page, limit, search, status });
  }
}
