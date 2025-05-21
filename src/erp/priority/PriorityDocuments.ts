import { Injectable } from '@nestjs/common';
import { Priority } from './priority';
import { DocumentDto } from '../dto/documents.dto';
import { DocumentItemsDto, DocumentItemDto, DocumentItemFileDto } from '../dto/documentItems.dto';

@Injectable()
export class PriorityDocumentsService {

  constructor(private readonly priority: Priority) {}

  private buildFilter(
    dateFrom: Date,
    dateTo: Date,
    userExtId?: string | null | undefined,
    dateField: string = 'CURDATE',
  ): string {
    const clauses = [
      `${dateField} ge ${dateFrom.toISOString()}`,
      `${dateField} le ${dateTo.toISOString()}`,
    ];
    if (userExtId) {
      clauses.push(`(AGENTCODE eq '${userExtId}' or CUSTNAME eq '${userExtId}')`);
    }
    return clauses.join(' and ');
  }

  private async getCount(
    table: string,
    dateFrom: Date,
    dateTo: Date,
    userExtId?: string | null | undefined,
    dateField: string = 'CURDATE',
  ): Promise<number> {
    const clauses = [
      `${dateField} ge ${dateFrom.toISOString()}`,
      `${dateField} le ${dateTo.toISOString()}`,
    ];
    if (userExtId) {
      clauses.push(`(AGENTCODE eq '${userExtId}' or CUSTNAME eq '${userExtId}')`);
    }
    const params: Record<string, any> = {
      $filter: clauses.join(' and '),
      $select: 'CUSTNAME',
    };
    const query = this.serializeParams(params);
    const data = await this.priority.GetRequest(`/${table}?${query}`);
    return data.length ?? 0;
  }

  private serializeParams(params: Record<string, any>): string {
    return Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }

  async getOrders(
    userExtId: string | undefined | null,
    dateFrom: Date,
    dateTo: Date,
    skip = 0,
    top = 50,
  ): Promise<{ data: DocumentDto[]; count: number }> {
    const params: Record<string, any> = {
      $filter: this.buildFilter(dateFrom, dateTo, userExtId),
      $select: 'CDES,CUSTNAME,QPRICE,CURDATE,ORDSTATUSDES,ORDNAME,STATUSDATE,AGENTCODE,AGENTNAME',
      $skip: skip,
      $top: top,
    };
    const query = this.serializeParams(params);

    const countPromise = this.getCount('ORDERS', dateFrom, dateTo, userExtId);
    const responsePromise = this.priority.GetRequest(`/ORDERS?${query}`);
    const [count, response] = await Promise.all([countPromise, responsePromise]);

    const data = response.map(item => ({
      userName: item.CDES,
      userExId: item.CUSTNAME,
      agentExId: item.AGENTCODE,
      agentName: item.AGENTNAME,
      total: item.QPRICE,
      createdAt: item.CURDATE,
      documentType: 'orders',
      status: item.ORDSTATUSDES,
      documentNumber: item.ORDNAME,
      updatedAt: item.STATUSDATE,
    }));
    return { data, count };
  }

  async getPriceOffers(
    userExtId: string | undefined | null,
    dateFrom: Date,
    dateTo: Date,
    skip = 0,
    top = 50,
  ): Promise<{ data: DocumentDto[]; count: number }> {
    console.time('getPriceOffers');
    const params: Record<string, any> = {
      $filter: this.buildFilter(dateFrom, dateTo, userExtId, 'PDATE'),
      $skip: skip,
      $top: top,
    };
    const query = this.serializeParams(params);

    const countPromise = this.getCount('CPROF', dateFrom, dateTo, userExtId, 'PDATE');
    const responsePromise = this.priority.GetRequest(`/CPROF?${query}`);
    const [count, response] = await Promise.all([countPromise, responsePromise]);

    const data = response.map(item => ({
      userName: item.CDES,
      userExId: item.CUSTNAME,
      total: item.QPRICE,
      createdAt: item.PDATE,
      documentType: 'priceOffer',
      status: item.STATDES,
      documentNumber: item.CPROFNUM,
      updatedAt: item.EXPIRYDATE,
    }));

    console.timeEnd('getPriceOffers');
    return { data, count };
  }

  async getDeliveryOrders(
    userExtId: string | undefined | null,
    dateFrom: Date,
    dateTo: Date,
    skip = 0,
    top = 50,
  ): Promise<{ data: DocumentDto[]; count: number }> {
    console.time('getDeliveryOrders');
    const params: Record<string, any> = {
      $filter: this.buildFilter(dateFrom, dateTo, userExtId, 'CURDATE'),
      $skip: skip,
      $top: top,
    };
    const query = this.serializeParams(params);

    const countPromise = this.getCount('DOCUMENTS_D', dateFrom, dateTo, userExtId, 'CURDATE');
    const responsePromise = this.priority.GetRequest(`/DOCUMENTS_D?${query}`);
    const [count, response] = await Promise.all([countPromise, responsePromise]);

    const data = response.map(item => ({
      userName: item.CDES,
      userExId: item.CUSTNAME,
      total: item.TOTQUANT,
      createdAt: item.CURDATE,
      documentType: 'deliveryOrder',
      status: item.STATDES,
      documentNumber: item.DOCNO,
      updatedAt: item.UDATE,
    }));

    console.timeEnd('getDeliveryOrders');
    return { data, count };
  }

  async getAiInvoices(
    userExtId: string | undefined | null,
    dateFrom: Date,
    dateTo: Date,
    skip = 0,
    top = 50,
  ): Promise<{ data: DocumentDto[]; count: number }> {
    console.time('getAiInvoices');
    const params: Record<string, any> = {
      $filter: this.buildFilter(dateFrom, dateTo, userExtId, 'IVDATE'),
      $skip: skip,
      $top: top,
    };
    const query = this.serializeParams(params);

    const countPromise = this.getCount('AINVOICES', dateFrom, dateTo, userExtId, 'IVDATE');
    const responsePromise = this.priority.GetRequest(`/AINVOICES?${query}`);
    const [count, response] = await Promise.all([countPromise, responsePromise]);

    const data = response.map(item => ({
      userName: item.CDES,
      userExId: item.CUSTNAME,
      total: item.QPRICE,
      createdAt: item.IVDATE,
      documentType: 'aiInvoices',
      status: item.STATDES,
      documentNumber: item.IVNUM,
      updatedAt: item.IVDATE,
    }));

    console.timeEnd('getAiInvoices');
    return { data, count };
  }

  async getCiInvoices(
    userExtId: string | undefined | null,
    dateFrom: Date,
    dateTo: Date,
    skip = 0,
    top = 50,
  ): Promise<{ data: DocumentDto[]; count: number }> {
    console.time('getCiInvoices');
    const params: Record<string, any> = {
      $filter: this.buildFilter(dateFrom, dateTo, userExtId, 'IVDATE'),
      $skip: skip,
      $top: top,
    };
    const query = this.serializeParams(params);

    const countPromise = this.getCount('CINVOICES', dateFrom, dateTo, userExtId, 'IVDATE');
    const responsePromise = this.priority.GetRequest(`/CINVOICES?${query}`);
    const [count, response] = await Promise.all([countPromise, responsePromise]);

    const data = response.map(item => ({
      userName: item.CDES,
      userExId: item.CUSTNAME,
      total: item.TOTPRICE,
      createdAt: item.IVDATE,
      documentType: 'ciInvoice',
      status: item.STATDES,
      documentNumber: item.IVNUM,
      updatedAt: item.IVDATE,
    }));

    console.timeEnd('getCiInvoices');
    return { data, count };
  }

  async getReturnDocs(
    userExtId: string | undefined | null,
    dateFrom: Date,
    dateTo: Date,
    skip = 0,
    top = 50,
  ): Promise<{ data: DocumentDto[]; count: number }> {
    console.time('getReturnDocs');
    const params: Record<string, any> = {
      $filter: this.buildFilter(dateFrom, dateTo, userExtId, 'CURDATE'),
      $skip: skip,
      $top: top,
    };
    const query = this.serializeParams(params);

    const countPromise = this.getCount('DOCUMENTS_N', dateFrom, dateTo, userExtId, 'CURDATE');
    const responsePromise = this.priority.GetRequest(`/DOCUMENTS_N?${query}`);
    const [count, response] = await Promise.all([countPromise, responsePromise]);

    const data = response.map(item => ({
      userName: item.CDES,
      userExId: item.CUSTNAME,
      total: item.TOTPRICE,
      createdAt: item.CURDATE,
      documentType: 'returnOrders',
      status: item.STATDES,
      documentNumber: item.DOCNO,
      updatedAt: item.UDATE,
    }));

    console.timeEnd('getReturnDocs');
    return { data, count };
  }

  async getOrderItems(documentNumber: string): Promise<DocumentItemsDto> {
    const params = {
      $filter: `ORDNAME eq '${documentNumber}'`,
      $expand: 'ORDERITEMS_SUBFORM($select=PARTNAME,PDES,PRICE,QUANT,TQUANT,QPRICE,PERCENT),EXTFILES_SUBFORM',
    };
    const [item] = await this.priority.GetRequest(`/ORDERS?${this.serializeParams(params)}`);

    return {
      totalAfterDiscount: item.DISPRICE,
      totalPrecent: item.PERCENT,
      totalPriceAfterTax: item.TOTPRICE,
      totalTax: item.VAT,
      documentType: 'orders',

      comment: item.COMMENT ?? '',          
      base64Pdf: item.BASE64PDF ?? '',       

      products: item.ORDERITEMS_SUBFORM.map(sub => ({
        sku:      sub.PARTNAME,
        title:    sub.PDES,
        quantity: sub.TQUANT,
        priceByOne: sub.PRICE,
        total:    sub.QPRICE,
        discount: sub.PERCENT,
        comment: sub.COMMENT ?? null,
        product: null,         
      })),

      files: item.EXTFILES_SUBFORM
        .filter(f => f.SUFFIX === 'pdf')
        .map(f => ({ name: f.EXTFILEDES, base64: f.EXTFILENAME })),
    };
  }

  async getPriceOfferItems(documentNumber: string): Promise<DocumentItemsDto> {
    const params = {
      $filter: `CPROFNUM eq '${documentNumber}'`,
      $expand: 'CPROFITEMS_SUBFORM,EXTFILES_SUBFORM',
    };
    const query = this.serializeParams(params);
    const [item] = await this.priority.GetRequest(`/CPROF?${query}`);
    return {
      totalAfterDiscount: item.DISPRICE,
      totalPrecent: item.PERCENT,
      totalPriceAfterTax: item.TOTPRICE,
      totalTax: item.VAT,
      documentType: 'priceOffer',
      comment: item.COMMENT ?? '',
      base64Pdf: item.BASE64PDF ?? '',
      products: item.CPROFITEMS_SUBFORM.map((sub: any) => ({
        sku: sub.PARTNAME,
        title: sub.PDES,
        quantity: sub.TQUANT,
        priceByOne: sub.PRICE,
        total: sub.QPRICE,
        discount: sub.PERCENT,
        comment: sub.COMMENT ?? null,
        product: sub.PRODUCTS ?? [],
      })),
      files: item.EXTFILES_SUBFORM
        .filter((file: any) => file.SUFFIX === 'pdf')
        .map((file: any) => ({ name: file.EXTFILEDES, base64: file.EXTFILENAME })),
    } as DocumentItemsDto;
  }

  async getDeliveryOrderItems(documentNumber: string): Promise<DocumentItemsDto> {
    const params = {
      $filter: `DOCNO eq '${documentNumber}'`,
      $expand: 'TRANSORDER_D_SUBFORM,EXTFILES_SUBFORM',
    };
    const query = this.serializeParams(params);
    const [item] = await this.priority.GetRequest(`/DOCUMENTS_D?${query}`);
    return {
      totalAfterDiscount: item.DISPRICE,
      totalPrecent: item.PERCENT,
      totalPriceAfterTax: item.TOTPRICE,
      totalTax: item.VAT,
      documentType: 'deliveryOrder',
      comment: item.COMMENT ?? '',
      base64Pdf: item.BASE64PDF ?? '',
      products: item.TRANSORDER_D_SUBFORM.map((sub: any) => ({
        sku: sub.PARTNAME,
        title: sub.PDES,
        quantity: sub.TQUANT,
        priceByOne: sub.PRICE,
        total: sub.QPRICE,
        discount: sub.PERCENT,
        comment: sub.COMMENT ?? null,
        product: sub.PRODUCTS ?? [],
      })),
      files: item.EXTFILES_SUBFORM
        .filter((file: any) => file.SUFFIX === 'pdf')
        .map((file: any) => ({ name: file.EXTFILEDES, base64: file.EXTFILENAME })),
    } as DocumentItemsDto;
  }

  async getAiInvoiceItems(documentNumber: string): Promise<DocumentItemsDto> {
    const params = {
      $filter: `IVNUM eq '${documentNumber}'`,
      $expand: 'AINVOICEITEMS_SUBFORM,EXTFILES_SUBFORM',
    };
    const query = this.serializeParams(params);
    const [item] = await this.priority.GetRequest(`/AINVOICES?${query}`);
    return {
      totalAfterDiscount: item.DISPRICE,
      totalPrecent: item.PERCENT,
      totalPriceAfterTax: item.TOTPRICE,
      totalTax: item.VAT,
      documentType: 'aiInvoice',
      comment: item.COMMENT ?? '',
      base64Pdf: item.BASE64PDF ?? '',
      products: item.AINVOICEITEMS_SUBFORM.map((sub: any) => ({
        sku: sub.PARTNAME,
        title: sub.PDES,
        quantity: sub.TQUANT,
        priceByOne: sub.PRICE,
        total: sub.QPRICE,
        discount: sub.PERCENT,
        comment: sub.COMMENT ?? null,
        product: sub.PRODUCTS ?? [],
      })),
      files: item.EXTFILES_SUBFORM
        .filter((file: any) => file.SUFFIX === 'pdf')
        .map((file: any) => ({ name: file.EXTFILEDES, base64: file.EXTFILENAME })),
    } as DocumentItemsDto;
  }

  async getCiInvoiceItems(documentNumber: string): Promise<DocumentItemsDto> {
    const params = {
      $filter: `IVNUM eq '${documentNumber}'`,
      $expand: 'CINVOICEITEMS_SUBFORM,EXTFILES_SUBFORM',
    };
    const query = this.serializeParams(params);
    const [item] = await this.priority.GetRequest(`/CINVOICES?${query}`);
    return {
      totalAfterDiscount: item.DISPRICE,
      totalPrecent: item.PERCENT,
      totalPriceAfterTax: item.TOTPRICE,
      totalTax: item.VAT,
      documentType: 'ciInvoice',
      comment: item.COMMENT ?? '',
      base64Pdf: item.BASE64PDF ?? '',
      products: item.CINVOICEITEMS_SUBFORM.map((sub: any) => ({
        sku: sub.PARTNAME,
        title: sub.PDES,
        quantity: sub.TQUANT,
        priceByOne: sub.PRICE,
        total: sub.QPRICE,
        discount: sub.PERCENT,
        comment: sub.COMMENT ?? null,
        product: sub.PRODUCTS ?? [],
      })),
      files: item.EXTFILES_SUBFORM
        .filter((file: any) => file.SUFFIX === 'pdf')
        .map((file: any) => ({ name: file.EXTFILEDES, base64: file.EXTFILENAME })),
    } as DocumentItemsDto;
  }

  async getReturnDocItems(documentNumber: string): Promise<DocumentItemsDto> {
    const params = {
      $filter: `DOCNO eq '${documentNumber}'`,
      $expand: 'TRANSORDER_N_SUBFORM,EXTFILES_SUBFORM',
    };
    const query = this.serializeParams(params);
    const [item] = await this.priority.GetRequest(`/DOCUMENTS_N?${query}`);
    return {
      totalAfterDiscount: item.DISPRICE,
      totalPrecent: item.PERCENT,
      totalPriceAfterTax: item.TOTPRICE,
      totalTax: item.VAT,
      documentType: 'returnOrders',
      comment: item.COMMENT ?? '',
      base64Pdf: item.BASE64PDF ?? '',
      products: item.TRANSORDER_N_SUBFORM.map((sub: any) => ({
        sku: sub.PARTNAME,
        title: sub.PDES,
        quantity: sub.TQUANT,
        priceByOne: sub.PRICE,
        total: sub.QPRICE,
        discount: sub.PERCENT,
        comment: sub.COMMENT ?? null,
        product: sub.PRODUCTS ?? [],
      })),
      files: item.EXTFILES_SUBFORM
        .filter((file: any) => file.SUFFIX === 'pdf')
        .map((file: any) => ({ name: file.EXTFILEDES, base64: file.EXTFILENAME })),
    } as DocumentItemsDto;
  }
}
