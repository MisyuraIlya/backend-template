import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VarietyService } from './variety.service';
import { CreateVarietyDto } from './dto/create-variety.dto';
import { UpdateVarietyDto } from './dto/update-variety.dto';

@Controller('variety')
export class VarietyController {
  constructor(private readonly varietyService: VarietyService) {}

  @Post()
  create(@Body() createVarietyDto: CreateVarietyDto) {
    return this.varietyService.create(createVarietyDto);
  }

  @Get()
  findAll() {
    return this.varietyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.varietyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVarietyDto: UpdateVarietyDto) {
    return this.varietyService.update(+id, updateVarietyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.varietyService.remove(+id);
  }
}
