import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateSupportCallDto } from './dto/create-support-call.dto';


@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('call')
  async requestCall(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: CreateSupportCallDto,
  ) {
    await this.supportService.sendSupportCallEmail(dto);
    return {
      status: true,
      message: 'Your support request has been sent. We’ll be in touch shortly.',
    };
  }
}
