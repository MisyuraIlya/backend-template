import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MediaObjectService } from './media-object.service';
import { CreateMediaObjectDto } from './dto/create-media-object.dto';
import { UpdateMediaObjectDto } from './dto/update-media-object.dto';

@Controller('media-object')
export class MediaObjectController {
  constructor(private readonly mediaObjectService: MediaObjectService) {}

  @Post()
  create(@Body() createMediaObjectDto: CreateMediaObjectDto) {
    return this.mediaObjectService.create(createMediaObjectDto);
  }

  @Get()
  findAll() {
    return this.mediaObjectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mediaObjectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMediaObjectDto: UpdateMediaObjectDto) {
    return this.mediaObjectService.update(+id, updateMediaObjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediaObjectService.remove(+id);
  }
}
