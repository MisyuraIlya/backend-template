import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { DocumentService } from './document.service';
import { CartCheckDto } from './dto/cart-check.dto';
import { StockInterceptor } from 'src/common/interceptors/stock.interceptor';
import { PriceInterceptor } from 'src/common/interceptors/price.interceptor';
import { StockHandler } from 'src/common/decorators/stock-handler.decorator';
import { PriceHandler } from 'src/common/decorators/price-handler.decorator';

@Controller('document')
@UseInterceptors(StockInterceptor, PriceInterceptor)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get('documentList/:documentType/:dateFrom/:dateTo')
  async findDocuments(
    @Param('documentType') documentType: string,
    @Param('dateFrom') dateFrom: string,
    @Param('dateTo') dateTo: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('userId') userId: number,
  ) {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);

    return this.documentService.getDocuments(documentType,fromDate,toDate,page,userId)
  }

  @Get('documentItems/:documentType/:documentNumber')
  async findDocumentItems(
    @Param('documentType') documentType: string,
    @Param('documentNumber') documentNumber: string,
  ) {
    return this.documentService.getDocumentItems(documentType,documentNumber)
  }

  @Get('cartesset/:dateFrom/:dateTo/:userId')
  async findCartesset(
    @Param('dateFrom') dateFrom: string,
    @Param('dateTo') dateTo: string,
    @Param('userId') userId: string,
  ) {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    return this.documentService.getCartesset(fromDate,toDate,+userId)
  }

  @Get('debit/:dateFrom/:dateTo/:userId')
  async findDebit(
    @Param('dateFrom') dateFrom: string,
    @Param('dateTo') dateTo: string,
    @Param('userId') userId: string,
  ) {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    return this.documentService.getDebit(fromDate,toDate,+userId)
  }

  @Get('restoreCart/:documentType/:userId/:documentNumber')
  @StockHandler()
  @PriceHandler()
  async restoreCart(
    @Param('documentType') documentType: string,
    @Param('userId') userId: string,
    @Param('documentNumber') documentNumber: string,
  ) {
    return this.documentService.restoreCart(documentType,+userId,documentNumber)
  }

  @Post('cartCheck')
  async cartCheck(@Body() dto: CartCheckDto) {
    return this.documentService.checkCart(dto)
  }

}
