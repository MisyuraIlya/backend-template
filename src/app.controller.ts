import { Controller, Get, Inject, LoggerService } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,                           
  ) {}

  @Get('1')
  @Public()
  getHello(): string {
    this.logger.log('IM LOGGERr', AppController.name);
    return this.appService.getHello();
  }

  @Get('2')
  @Public()
  getHello2(): string {
    this.logger.error('IM ERROR', /* trace? */ '', AppController.name);
    return this.appService.getHello();
  }

  @Get('3')
  @Public()
  getHello3(): string {
    this.logger.warn('IM WARN');
    return this.appService.getHello();
  }

  @Get('healthcheck')
  @Public()
  healthCheck(): { status: string } {
    this.logger.log('Health check OK', AppController.name);
    return { status: 'ok' };
  }
}