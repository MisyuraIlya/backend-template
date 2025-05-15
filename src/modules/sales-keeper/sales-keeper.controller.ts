import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SalesKeeperService } from './sales-keeper.service';
import { CreateSalesKeeperDto } from './dto/create-sales-keeper.dto';
import { UpdateSalesKeeperDto } from './dto/update-sales-keeper.dto';

@Controller('sales-keeper')
export class SalesKeeperController {
  constructor(private readonly salesKeeperService: SalesKeeperService) {}

  @Post()
  create(@Body() createSalesKeeperDto: CreateSalesKeeperDto) {
    return this.salesKeeperService.create(createSalesKeeperDto);
  }

  @Get()
  findAll() {
    return this.salesKeeperService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesKeeperService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSalesKeeperDto: UpdateSalesKeeperDto) {
    return this.salesKeeperService.update(+id, updateSalesKeeperDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesKeeperService.remove(+id);
  }
}
