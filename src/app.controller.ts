// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AppLogger } from './common/logger/logger.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: AppLogger,                              
  ) {}

  @Get()
  @Public()
  getHello(): string {
    this.logger.log('HELLO WORLD');

    return this.appService.getHello();
  }
}
