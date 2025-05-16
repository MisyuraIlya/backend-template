import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { DocumentService } from './document.service';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get('documentList/:documentType/:dateFrom/:dateTo')
  async findDocuments(
    @Param('documentType') documentType: string,
    @Param('dateFrom') dateFrom: string,
    @Param('dateTo') dateTo: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('userId', ParseIntPipe) userId: number,
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


}
