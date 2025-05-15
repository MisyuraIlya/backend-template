import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PriceListUserService } from './price-list-user.service';
import { CreatePriceListUserDto } from './dto/create-price-list-user.dto';
import { UpdatePriceListUserDto } from './dto/update-price-list-user.dto';

@Controller('price-list-user')
export class PriceListUserController {
  constructor(private readonly priceListUserService: PriceListUserService) {}

  @Post()
  create(@Body() createPriceListUserDto: CreatePriceListUserDto) {
    return this.priceListUserService.create(createPriceListUserDto);
  }

  @Get()
  findAll() {
    return this.priceListUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.priceListUserService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePriceListUserDto: UpdatePriceListUserDto) {
    return this.priceListUserService.update(+id, updatePriceListUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.priceListUserService.remove(+id);
  }
}
