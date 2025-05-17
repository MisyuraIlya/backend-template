import { Controller, Get, Param, Query, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Crud, CrudController } from '@dataui/crud';
import { In, Not } from 'typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UsersTypes } from './enums/UsersTypes';

@Crud({
  model: { type: User },
  params: {
    id: { field: 'id', type: 'number', primary: true },
  },
})
@Controller('user')
export class UserController implements CrudController<User> {
  constructor(public readonly service: UserService) {}

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 25,
    @Query('isAgent') isAgent?: string,
    @Query('isBlocked') isBlocked?: string,
  ) {
    const where: any = {};

    if (isAgent !== undefined) {
      if (isAgent === 'true') {
        where.role = In([UsersTypes.AGENT, UsersTypes.SUPER_AGENT]);
      } else {
        where.role = Not(In([UsersTypes.AGENT, UsersTypes.SUPER_AGENT]));
      }
    }

    if (isBlocked !== undefined) {
      where.isBlocked = isBlocked === 'true';
    }

    return this.service.findWithFilters(where, {
      page:  +page,
      limit: +limit,
    });
  }

  @Get('userProfile/:userId')
  async getUserProfile(@Param('userId') userId: string) {
    return this.service.getUserProfile(+userId);
  }

  @Get('salesKeeper/:userId')
  async getSalesKeeper(@Param('userId') userId: string) {
    return this.service.getSalesKeeper(+userId);
  }

  @Get('quantityKeeper/:userId')
  async getQuantityKeeper(@Param('userId') userId: string) {
    return this.service.getQuantityKeeper(+userId);
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

  @Get('agentsStatistic/:dateFrom/:dateTo')
  async agentsStatistic(
    @Param('dateFrom') dateFrom: string,
    @Param('dateTo')   dateTo:   string,
  ) {
    return this.service.getAgentsStatistic(
      new Date(dateFrom),
      new Date(dateTo),
    );
  }

  @Get('agentProfile/:agentId/:dateFrom/:dateTo')
  async agentStatistic(
    @Param('agentId')  agentId:   string,
    @Param('dateFrom') dateFrom:  string,
    @Param('dateTo')   dateTo:    string,
  ) {
    return this.service.getAgentStatistic(
      +agentId,
      new Date(dateFrom),
      new Date(dateTo),
    );
  }

  @Get('calendar/:agentId/:dateFrom/:dateTo')
  async agentCalendar(
    @Param('agentId')  agentId:   string,
    @Param('dateFrom') dateFrom:  string,
    @Param('dateTo')   dateTo:    string,
  ) {
    return this.service.agentCalendar(
      +agentId,
      new Date(dateFrom),
      new Date(dateTo),
    );
  }
}
