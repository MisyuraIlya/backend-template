import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Crud, CrudController } from '@dataui/crud';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

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

  @Post('send-notification')
  async findDebit(@Body() dto: CreateNotificationDto) {
    return this.service.sendNotification(dto)
  }

  @Post('subscribe')
  subscribe(@Body() subscription: any) {
    // e.g. this.subscriptionsRepository.save(subscription);
    return { success: true };
  }



}
