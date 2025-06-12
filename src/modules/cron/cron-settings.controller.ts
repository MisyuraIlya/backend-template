import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CronSettingsService } from './cron-settings.service';
import { CreateCronSettingsDto } from './dto/create-cron-settings.dto';
import { UpdateCronSettingsDto } from './dto/update-cron-settings.dto';

@Controller('cron-settings')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class CronSettingsController {
  constructor(private readonly cronSettingsService: CronSettingsService) {}

  @Get()
  getAll() {
    return this.cronSettingsService.getAll();
  }

  @Post()
  create(@Body() dto: CreateCronSettingsDto) {
    return this.cronSettingsService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCronSettingsDto,
  ) {
    return this.cronSettingsService.update(id, dto);
  }
}
