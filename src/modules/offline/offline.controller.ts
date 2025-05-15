import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OfflineService } from './offline.service';
import { CreateOfflineDto } from './dto/create-offline.dto';
import { UpdateOfflineDto } from './dto/update-offline.dto';

@Controller('offline')
export class OfflineController {
  constructor(private readonly offlineService: OfflineService) {}

  @Post()
  create(@Body() createOfflineDto: CreateOfflineDto) {
    return this.offlineService.create(createOfflineDto);
  }

  @Get()
  findAll() {
    return this.offlineService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offlineService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOfflineDto: UpdateOfflineDto) {
    return this.offlineService.update(+id, updateOfflineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.offlineService.remove(+id);
  }
}
