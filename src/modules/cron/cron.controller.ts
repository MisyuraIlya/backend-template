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
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CronService } from './cron.service';
import { CreateCronDto } from './dto/create-cron.dto';
import { UpdateCronDto } from './dto/update-cron.dto';

@Controller('cron')
@UsePipes(
  new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
)
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Post()
  create(@Body() dto: CreateCronDto) {
    return this.cronService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCronDto,
  ) {
    return this.cronService.update(id, dto as any);
  }

  @Get()
  getAll() {
    return this.cronService.findAll();
  }


  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cronService.findOne(id);
  }

  @Get('status/:jobName')
  status(@Param('jobName') jobName: string) {
    return this.cronService.getStatus(jobName);
  }

  @Post('run/:jobName')
  async run(
    @Param('jobName') jobName: string,
  ): Promise<{ status: boolean; message: string }> {
    try {
      return await this.cronService.run(jobName);
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new BadRequestException(err.message);
    }
  }

  @Post('allCrons')
  async allCrons(): Promise<{ status: boolean; message: string }> {
    try {
      return await this.cronService.runAllCrons();
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }
  }
}
