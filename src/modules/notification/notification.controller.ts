import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Crud, CrudController } from '@dataui/crud';
import { Notification } from './entities/notification.entity';

@Crud({
  model: { type: Notification },
  params: {
    id: {
      field: 'id',
      type: 'number',
      primary: true,
    },
  },
})
@Controller('notification')
export class NotificationController implements CrudController<Notification> {
  constructor(public readonly service: NotificationService) {}


}
