import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';
import { NotificationUserService } from './notification-user.service';
import { CreateNotificationUserDto } from './dto/create-notification-user.dto';
import { UpdateNotificationUserDto } from './dto/update-notification-user.dto';
import { Crud, CrudController } from '@dataui/crud';
import { NotificationUser } from './entities/notification-user.entity';

@Crud({
  model: { type: NotificationUser },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
})
@Controller('notification-user')
export class NotificationUserController implements CrudController<NotificationUser> {
  constructor(public readonly service: NotificationUserService) {}

  @Get()
  async findAll(
    @Query('user.id', ParseIntPipe) userId?: number,
    @Query('isRead', ParseBoolPipe) isRead?: boolean,
  ): Promise<NotificationUser[]> {
    return this.service.findByFilters(userId, isRead);
  }
}
