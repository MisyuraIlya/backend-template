import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PriceListDetailedService } from './price-list-detailed.service';
import { CreatePriceListDetailedDto } from './dto/create-price-list-detailed.dto';
import { UpdatePriceListDetailedDto } from './dto/update-price-list-detailed.dto';

@Controller('price-list-detailed')
export class PriceListDetailedController {
  constructor(private readonly priceListDetailedService: PriceListDetailedService) {}

  @Post()
  create(@Body() createPriceListDetailedDto: CreatePriceListDetailedDto) {
    return this.priceListDetailedService.create(createPriceListDetailedDto);
  }

  @Get()
  findAll() {
    return this.priceListDetailedService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.priceListDetailedService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePriceListDetailedDto: UpdatePriceListDetailedDto) {
    return this.priceListDetailedService.update(+id, updatePriceListDetailedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.priceListDetailedService.remove(+id);
  }
}
