import axios from "axios";
import { AgentStatisticDto } from "../dto/agentStatistic.dto";
import { BonusDto } from "../dto/bonusItem.dto";
import { CategoryDto } from "../dto/category.dto";
import { DocumentItemDto, DocumentItemFileDto, DocumentItemsDto } from "../dto/documentItems.dto";
import { DocumentDto, DocumentsDto } from "../dto/documents.dto";
import { dynamicTableDto } from "../dto/dynamicTable";
import { PriceDto } from "../dto/price.dto";
import { PriceListDto } from "../dto/priceList.dto";
import { PriceListDetailedDto } from "../dto/priceListDetailed.dto";
import { PriceListUserDto } from "../dto/priceListUser.dto";
import { ProductDto } from "../dto/product.dto";
import { PurchaseDeliveryItemDto } from "../dto/purchaseDelivery.dto";
import { PurchaseHistoryItem } from "../dto/purchaseHistoryItem.dto";
import { SalesKeeperAlertDto } from "../dto/salesKeeperAlert.dto";
import { SalesQuantityKeeperAlertLineDto } from "../dto/salesQuantityKeeperAlert.dto";
import { StockDto } from "../dto/stock.do";
import { UserDto } from "../dto/user.dto";
import { CoreInterface } from "../interfaces/core.interface";
import { CronInterface } from "../interfaces/cron.interface";
import { OnlineInterface } from "../interfaces/online.interface";
import { WarehousesItemDetailedDto } from "../dto/warehouse.dto";
import { User } from "src/modules/user/entities/user.entity";


export class Sap implements CoreInterface, CronInterface, OnlineInterface {
    private username: string;
    private password: string;
    private url: string;
    private erpDb: string;
  
    private sessionId: string | null = null;
    private routeId: string | null = null;
  
    constructor(erp: IErpCredentials) {
      this.username = erp.username;
      this.password = erp.password;
      this.url = erp.url;
      this.erpDb = erp.erpDb;
    }
  
    private async fetchToken(): Promise<void> {
      const loginUrl = `${this.url}/Login`;
      try {
        const response = await axios.post(loginUrl, {
          CompanyDB: this.erpDb,
          UserName: this.username,
          Password: this.password
        });
  
        if (response.status === 200) {
          this.sessionId = response.data.SessionId;
          const cookies = response.headers['set-cookie'];
          this.routeId = cookies?.find(cookie => cookie.startsWith('ROUTEID='))?.split(';')[0].split('=')[1]!;
        } else {
          throw new Error('Unable to fetch token');
        }
      } catch (error) {
        throw new Error(`Error fetching token: ${error.message}`);
      }
    }
    
    async GetRequest(query?: string, pageSize: number = 20): Promise<any> {
        if (!query) {
            throw new Error('Query cannot be null.');
        }
        return this.makeAuthorizedRequest('GET', query, {}, pageSize);
    }
    
    async PatchRequest(object: object, table: string): Promise<any> {
        return this.makeAuthorizedRequest('PATCH', table, object);
    }
    
    async PostRequest(object: any, table: string): Promise<any> {
        return this.makeAuthorizedRequest('POST', table, object);
    }

    private async makeAuthorizedRequest(method: 'GET' | 'POST' | 'PATCH', endpoint: string, body: any = {}, pageSize?: number) {
      if (!this.sessionId) await this.fetchToken();
  
      const headers = {
        'Cookie': `B1SESSION=${this.sessionId}; ROUTEID=${this.routeId}`,
        ...(pageSize && { 'Prefer': `odata.maxpagesize=${pageSize}` })
      };
  
      try {
        const response = await axios({
          method,
          url: `${this.url}${endpoint}`,
          headers,
          data: body,
          params: { ...body }
        });
        return response.data;
      } catch (error) {
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  
    async GetCategories(): Promise<CategoryDto[]> {
      const endpoint = "/Categories";
      const response = await this.makeAuthorizedRequest('GET', endpoint);
      return response.value.map((item: any) => ({
        categoryName: item.CategoryTitle,
        englishCategoryName: item.U_EnglishCategory,
        categoryId: item.CategoryCode
      }));
    }
  
    async GetProducts(pageSize: number = 20, skip: number = 0): Promise<ProductDto[]> {
      const endpoint = "/Items";
      const response = await this.makeAuthorizedRequest('GET', endpoint, { $top: pageSize, $skip: skip });
      return response.value.map((item: any) => ({
        sku: item.ItemCode,
        title: item.ItemName,
        categoryLvl1Id: item.ItemsGroupCode,
        status: item.U_IsVisibleOnWebshop === 'Y'
      }));
    }
  
    async GetUsers(): Promise<UserDto[]> {
      const endpoint = "/BusinessPartners";
      const response = await this.makeAuthorizedRequest('GET', endpoint, { $filter: "CardType eq 'cCustomer'" });
      return response.value.map((item: any) => ({
        userExId: item.CardCode,
        name: item.CardName,
        phone: item.Cellular,
        address: item.Address,
        isBlocked: item.Frozen === 'tYES'
      }));
    }

    // @ts-ignore
    async FindUser({ userExtId, phone }: { userExtId: string; phone: string; }): Promise<UserDto> {
      
    }
  
    async GetPriceList(): Promise<PriceListDto[]> {
      const endpoint = "/PriceLists";
      const response = await this.makeAuthorizedRequest('GET', endpoint);
      return response.value.map((item: any) => ({
        priceListExtId: item.PriceListNo,
        priceListTitle: item.PriceListName
      }));
    }
  
    async GetAgentStatistic(agentId: string, dateFrom: string, dateTo: string): Promise<AgentStatisticDto> {
      const endpoint = `/SQLQueries('getAgentStatistic')/List`;
      const queryParams = { agentCode: agentId, dateFrom, dateTo };
      const response = await this.makeAuthorizedRequest('GET', endpoint, queryParams);
  
      return {
        averageTotalBasketChoosedDates: response.value[0]?.AverageTotalBasketChoosedDates || 0,
        averageTotalBasketMonth: response.value[0]?.AverageTotalBasketMonth || 0,
        averageTotalBasketToday: response.value[0]?.AverageTotalBasketToday || 0,
        totalInvoicesChoosedDates: response.value[0]?.totalInvoicesChoosedDates || 0,
        totalInvoicesMonth: response.value[0]?.totalInvoicesMonth || 0,
        totalInvoicesToday: response.value[0]?.totalInvoicesToday || 0,
        totalPriceChoosedDates: response.value[0]?.totalPriceChoosedDates || 0,
        totalPriceMonth: response.value[0]?.totalPriceMonth || 0,
        totalPriceToday: response.value[0]?.totalPriceToday || 0
      };
    }
  
    async GetStocks(): Promise<StockDto[]> {
      const endpoint = "/Stocks";
      const response = await this.makeAuthorizedRequest('GET', endpoint);
      return response.value.map((item: any) => ({
        sku: item.ItemCode,
        stock: item.InStock,
        warehouse: item.WarehouseCode
      }));
    }
  
    async GetBonuses(): Promise<BonusDto[]> {
      const endpoint = "/Bonuses";
      const response = await this.makeAuthorizedRequest('GET', endpoint);
      return response.value.map((item: any) => ({
        sku: item.Sku,
        minimumQuantity: item.MinimumQuantity,
        bonusSku: item.BonusSku,
        bonusQuantity: item.BonusQuantity
      }));
    }
  
    async GetDocuments(dateFrom: Date, dateTo: Date, documentsType: string, pageSize: number, currentPage: number, user?: any, search?: string): Promise<DocumentsDto> {
      const endpoint = `/${documentsType}`;
      const skip = (currentPage - 1) * pageSize;
      const filter = `DocDate ge ${dateFrom.toISOString()} and DocDate le ${dateTo.toISOString()}`;
      const searchFilter = search ? `(contains(DocNum, '${search}') or contains(CardCode, '${search}') or contains(CardName, '${search}'))` : '';
      const queryParams = {
        $filter: `${filter} and ${searchFilter}`,
        $top: pageSize,
        $skip: skip
      };
      const response = await this.makeAuthorizedRequest('GET', endpoint, queryParams);
      return response.value.map((item: any) => ({
        documentNumber: item.DocNum,
        documentType: item.DocumentType,
        userName: item.CardName,
        status: item.DocumentStatus,
        total: item.DocTotal,
        createdAt: item.DocDate,
        updatedAt: item.UpdateDate
      }));
    }
  
    async GetDocumentItems(
      documentNumber: string,
      documentType: string,
      userExId?: string
    ): Promise<DocumentItemsDto> {
      const endpoint = `/${documentType}`;
      const queryParams = {
        $filter: `DocNum eq ${documentNumber}`,
        $select: "DocTotal,VatSum,DiscountPercent,DocumentLines,Comments,Attachments"
      };

      // 1) Fetch the document
      const response = await this.makeAuthorizedRequest('GET', endpoint, queryParams);
      if (!response.value || response.value.length === 0) {
        throw new Error(`Document ${documentNumber} not found`);
      }
      const doc = response.value[0];

      // 2) Map lines to products
      const products: DocumentItemDto[] = doc.DocumentLines.map((line: any) => ({
        sku: line.ItemCode,
        title: line.ItemDescription,
        quantity: line.Quantity,
        priceByOne: line.Price,
        total: line.LineTotal,
        discount: line.DiscountPercent,
        product: line
      }));

      // 3) Map any attachments into your files DTO
      //    (if your API returns attachments; otherwise leave empty)
      const files: DocumentItemFileDto[] = (doc.Attachments ?? []).map((att: any) => ({
        fileName: att.FileName,
        url: att.FileURL,
        // …other fields your DTO needs
      }));

      // 4) Compute the totals
      const totalTax = doc.VatSum;
      const totalPriceAfterTax = doc.DocTotal;
      const totalAfterDiscount = doc.DocTotal - (doc.DocTotal * (doc.DiscountPercent ?? 0) / 100);
      const totalPrecent = doc.DiscountPercent;

      // 5) (Optional) pull in comments, PDF, etc.
      const comment = doc.Comments ?? null;
      // If you have an attachment entry you need to fetch separately, do it here:
      // const base64Pdf = doc.AttachmentEntry 
      //   ? await this.fetchPdfAsBase64(doc.AttachmentEntry) 
      //   : null;
      const base64Pdf = null; // ← adjust if you fetch the PDF

      return {
        products,
        files,
        totalTax,
        totalPriceAfterTax,
        totalAfterDiscount,
        totalPrecent,
        documentType,
        comment,
        base64Pdf
      };
    }
  
    async SendOrder(history: any): Promise<string> {
      const endpoint = "/Orders";
      const orderData = {
        CardCode: history.userExId,
        Series: 6,
        DocDate: new Date().toISOString(),
        DocDueDate: new Date().toISOString(),
        DocumentLines: history.items.map((item: any) => ({
          ItemCode: item.sku,
          Quantity: item.quantity,
          UnitPrice: item.priceByOne
        }))
      };
      const response = await this.makeAuthorizedRequest('POST', endpoint, orderData);
      return response.DocNum;
    }
  
    async PurchaseHistoryByUserAndSku(userExtId: string, sku: string): Promise<PurchaseHistoryItem[]> {
      const endpoint = "/SQLQueries('GetInvoicesByUserAndSku')/List";
      const queryParams = { cardCode: userExtId, itemCode: sku };
      const response = await this.makeAuthorizedRequest('GET', endpoint, queryParams);
      return response.value.map((item: any) => ({
        documentNumber: item.DocNum,
        date: item.DocDate,
        quantity: item.Quantity,
        price: item.Price,
        vatPrice: item.VatPrice,
        totalPrice: item.TotalPrice
      }));
    }
  
    async SalesKeeperAlert(userExtId: string): Promise<SalesKeeperAlertDto> {
      const endpoint = "/SQLQueries('salesKeeper')/List";
      const queryParams = { cardCode: userExtId };
      const response = await this.makeAuthorizedRequest('GET', endpoint, queryParams);
      return {
        sumPreviousMonthCurrentYear: response.value[0]?.CurrentMonthSum || 0,
        sumPreviousMonthPreviousYear: response.value[0]?.PreviousYearMonthSum || 0,
        averageLastThreeMonths: response.value[0]?.ThreeMonthAvg || 0
      };
    }
  
    async GetStockOnline(sku: string | string[], warehouse?: string): Promise<StockDto[]> {
      const endpoint = "/SQLQueries('GetStockByItemCodeAndWarehouse')/List";
      const queryParams = { ItemCode: sku, warehouse };
      const response = await this.makeAuthorizedRequest('GET', endpoint, queryParams);
      return response.value.map((item: any) => ({
        sku: item.Sku,
        stock: item.Stock - item.Committed,
        warehouse: item.Warehouse
      }));
    }
  
    async ProductsImNotBuy(userExtId: string): Promise<string[]> {
      const response = await this.makeAuthorizedRequest('GET', '/Invoices', { cardCode: userExtId });
      const boughtItems = response.value
        .flatMap((invoice: any) =>
          invoice.DocumentLines
            .map((line: any) => line.ItemCode as string | undefined)
            .filter((code): code is string => code != null)
        );

      const allProducts = await this.GetProducts();

      const notBoughtSkus = allProducts
        .map(p => p.sku)                         
        .filter((sku): sku is string =>         
          sku != null && !boughtItems.includes(sku)
        );

      return notBoughtSkus;                     
    }

    async GetUserProfile(userExtId: string): Promise<any> {

    }
      
    async GetDeliveryDates(userExtId: string): Promise<any[]> {
        const endpoint = "/SQLQueries('GetDetailsByZoneAndDelivery')/List";
        const queryParams = { cardCode: userExtId };
        const response = await this.makeAuthorizedRequest('GET', endpoint, queryParams);
        
        return response.value.map((item: any) => ({
            area: item.U_DelArea,
            city: item.City,
            hour: item.Hour,
            street: item.Street,
            weekDay: item.WeekDay,
            zoneCode: item.ZoneCode
        }));
    }
      
    async GetWarehouseDetailedBySku(
      sku: string,
      warehouses: string[]
    ): Promise<WarehousesItemDetailedDto[]> {
      const endpoint = "/Warehouses";
      
      const warehouseFilter = warehouses
        .map(w => `WarehouseCode eq '${w}'`)
        .join(" or ");
      
      const queryParams = {
        $select: "WarehouseCode, WarehouseName, City, Street",
        $filter: `ItemCode eq '${sku}' and (${warehouseFilter})`
      };
      
      const response = await this.makeAuthorizedRequest(
        "GET",
        endpoint,
        queryParams
      );

      // map into your DTO
      const warehouseDetails: WarehousesItemDetailedDto[] = response.value.map(
        (item: any) => ({
          warehouseCode: item.WarehouseCode,
          warehouseName: item.WarehouseName,
          city: item.City,
          street: item.Street
        })
      );

      return warehouseDetails;
    }

    async GetDebit(userExId: string, dateFrom: Date, dateTo: Date): Promise<dynamicTableDto> {
      const formattedDateFrom = dateFrom.toISOString().split('T')[0]; // 'YYYY-MM-DD'
      const formattedDateTo = dateTo.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    
      const endpoint1 = `/SQLQueries('GetInvoicesOnly')/List`;
      const queryParams1 = {
        dateFrom: `'${formattedDateFrom}'`,
        dateTo: `'${formattedDateTo}'`,
        cardCode: `'${userExId}'`
      };
      const queryString1 = new URLSearchParams(queryParams1).toString();
      const urlQuery1 = `${endpoint1}?${queryString1}`;
    
      const endpoint2 = `/SQLQueries('GetCreditNotesOnly')/List`;
      const queryParams2 = {
        dateFrom: `'${formattedDateFrom}'`,
        dateTo: `'${formattedDateTo}'`,
        cardCode: `'${userExId}'`
      };
      const queryString2 = new URLSearchParams(queryParams2).toString();
      const urlQuery2 = `${endpoint2}?${queryString2}`;
    
      const response1 = await this.makeAuthorizedRequest('GET', urlQuery1, {}, 100000);
      const response2 = await this.makeAuthorizedRequest('GET', urlQuery2, {}, 100000);
    
      const merged = [...response1.value, ...response2.value];
    
      merged.sort((a: any, b: any) => {
        return a.DocDate.localeCompare(b.DocDate);
      });
    
      const result: dynamicTableDto = {
        columns: ['Pay Date', 'Created At', 'Type', 'Document Number', 'Num At Card', 'Debit', 'Line Sum'],
        columnsEnglish: ['Pay Date', 'Created At', 'Type', 'Document Number', 'Num At Card', 'Debit', 'Line Sum'],
        lines: []
      };
    
      let runningSum = 0;
    
      for (const item of merged) {
        const debit = item.type === 1 ? item.DocTotal : -item.DocTotal;
        runningSum += debit;
    
        const row = [
          item.DocDueDate, 
          item.DocDate, 
          item.type === 1 ? 'Invoice' : 'Credit Note', 
          item.DocNum, 
          item.NumAtCard,
          debit, 
          runningSum 
        ];
    
        result.lines.push(row);
    
        const monthKey = new Date(item.DocDueDate).toISOString().slice(0, 7);
    
        // const monthObj = result.head.find((headItem: any) => headItem.name === monthKey);
        // if (monthObj) {
        //   monthObj.number += debit;
        // } else {
        //   result.head.push({
        //     name: monthKey,
        //     number: debit
        //   });
        // }
      }
    
      return result;
    }
      
    async GetPackMain(): Promise<any> {
        const endpoint = "/PacksMain";
        const response = await this.makeAuthorizedRequest('GET', endpoint);
        
        return response.value.map((item: any) => ({
            packCode: item.PackCode,
            packName: item.PackName,
            description: item.Description,
            quantity: item.Quantity
        }));
        }
      
    async GetAgents(): Promise<any[]> {
        const endpoint = "/SalesPersons";
        const response = await this.makeAuthorizedRequest('GET', endpoint);
        
        return response.value.map((item: any) => ({
            agentCode: item.SalesEmployeeCode,
            agentName: item.SalesEmployeeName,
            phone: item.Mobile,
            active: item.Active === 'tYES'
        }));
    }
      
    async GetPriceListUser(): Promise<PriceListUserDto[]> {
      const endpoint = "/BusinessPartners";
      const queryParams = { '$select': 'CardCode,PriceListNum' };
      const queryString = new URLSearchParams(queryParams).toString();
      let urlQuery = `${endpoint}?${queryString}`;

      const result: PriceListUserDto[] = [];

      do {
        const response = await this.makeAuthorizedRequest('GET', urlQuery);

        response.value.forEach((itemRec: any) => {
          const userPrice: PriceListUserDto = {
            userExId:     itemRec.CardCode,
            priceListExId: itemRec.PriceListNum
          };
          result.push(userPrice);
        });

        urlQuery = response['@odata.nextLink']
          ? `/${response['@odata.nextLink']}`
          : '';
      } while (urlQuery);

      return result;
    }


    async GetPriceListDetailed(): Promise<PriceListDetailedDto[]> {
      return []
    }
      
    async GetPurchaseDelivery(sku: string): Promise<PurchaseDeliveryItemDto[]> {
        const endpoint = "/SQLQueries('GetPurchaseDeliveryNotesBySKU')/List";
        const queryParams = { sku };
        const response = await this.makeAuthorizedRequest('GET', endpoint, queryParams);
      
        return response.value.map((item: any) => ({
          sku: item.ItemCode,
          address: item.Address,
          warehouse: item.WarehouseCode,
          status: item.LineStatus,
          quantity: item.Quantity,
          docNumber: item.DocNum,
          ShipDate: item.ShipDate,
          actualDeliveryDate: item.ActualDeliveryDate
        }));
    }

    async GetCartesset(userExId: string, dateFrom: Date, dateTo: Date): Promise<dynamicTableDto> {
      const formattedDateFrom = dateFrom.toISOString();
      const formattedDateTo = dateTo.toISOString();
    
      const endpoint = "/JournalEntries";
      const queryParams = {
        '$filter': `Reference eq '${userExId}' and ReferenceDate ge '${formattedDateFrom}' and ReferenceDate le '${formattedDateTo}'`,
        '$select': 'JournalEntryLines'
      };
      
      const queryString = new URLSearchParams(queryParams).toString();
      const urlQuery = `${endpoint}?${queryString}`;
    
      const response = await this.makeAuthorizedRequest('GET', urlQuery);
    
      const result: dynamicTableDto = {
        columns: [
          'ת. למאזן',
          'תנועה',
          'ת.אסמכתא',
          'ת.ערך',
          'אסמכתא',
          'פרטים',
          'חובה/זכות',
          'יתרה'
        ],
        columnsEnglish: [
          'Account Balance',
          'Transaction',
          'Reference Number',
          'Date',
          'Memo',
          'Credit',
          'Debit',
          'Balance'
        ],
        lines: []
      };
    
      response.value.forEach((item: any) => {
        item.JournalEntryLines.forEach((subItem: any) => {
          const row = [
            subItem.DueDate,                             
            subItem.AccountCode,                        
            subItem.ShortName,                           
            new Date(subItem.ReferenceDate1).toLocaleDateString('en-GB'), 
            subItem.LineMemo,                            
            subItem.Credit,                              
            subItem.Debit,                               
            subItem.DebitSys                             
          ];
    
          result.lines.push(row);
        });
      });
    
      return result;
    }

    async GetDocumentsItem(documentNumber: string, documentType: string, userExId?: string): Promise<DocumentItemsDto> {
      const endpoint = `/${documentType}`;
      const queryParams = {
        '$filter': `DocNum eq ${documentNumber}`,
        '$select': 'DocTotal,VatSum,DiscountPercent,DocumentLines,NumAtCard,CardCode,DocDate'
      };
    
      const queryString = new URLSearchParams(queryParams).toString();
      const urlQuery = `${endpoint}?${queryString}`;
    
      const response = await this.makeAuthorizedRequest('GET', urlQuery);
    
      const result: DocumentItemsDto = {
        products: [],
        files: []
      };
    
      response.value.forEach((itemRec: any) => {
        result.totalAfterDiscount = itemRec.DocTotal;
        result.totalPrecent = itemRec.DiscountPercent;
        result.totalPriceAfterTax = itemRec.DocTotal;
        result.totalTax = itemRec.VatSum;
        result.documentType = documentType;
    
        itemRec.DocumentLines.forEach((subItem: any) => {
          const dto: DocumentItemDto = {
            sku: subItem.ItemCode,
            quantity: subItem.Quantity,
            title: subItem.ItemDescription,
            priceByOne: subItem.Price,
            total: subItem.LineTotal,
            discount: subItem.DiscountPercent,
            comment: subItem.FreeText,
            product: []
          };
    
          result.products.push(dto);
        });
      });
    
      return result;
    }

    async SalesQuantityKeeperAlert(userExtId: string): Promise<SalesQuantityKeeperAlertLineDto[]> {
      // Format the necessary date values for the query
      const dateCurrent = new Date();
      const nextMonthCurrent = new Date(dateCurrent.setMonth(dateCurrent.getMonth() - 1));
      const previousDateStart = new Date(dateCurrent.setFullYear(dateCurrent.getFullYear() - 1, dateCurrent.getMonth() - 2));
      const nextMonthPreviousStart = new Date(dateCurrent.setFullYear(dateCurrent.getFullYear() - 1, dateCurrent.getMonth() - 1));
      const threeMonthsAgoStart = new Date(dateCurrent.setMonth(dateCurrent.getMonth() - 4));
      const threeMonthsAgoEnd = new Date(dateCurrent.setMonth(dateCurrent.getMonth() - 1));
    
      // Format dates to 'YYYY-MM-DD' strings
      const formattedDateCurrent = dateCurrent.toISOString().split('T')[0];
      const formattedNextMonthCurrent = nextMonthCurrent.toISOString().split('T')[0];
      const formattedPreviousDateStart = previousDateStart.toISOString().split('T')[0];
      const formattedNextMonthPreviousStart = nextMonthPreviousStart.toISOString().split('T')[0];
      const formattedThreeMonthsAgoStart = threeMonthsAgoStart.toISOString().split('T')[0];
      const formattedThreeMonthsAgoEnd = threeMonthsAgoEnd.toISOString().split('T')[0];
    
      // Prepare the query parameters for the request
      const endpoint = "/SQLQueries('quantityKeeper')/List";
      const queryParams = {
        cardCode: `'${userExtId}'`,
        dateFrom: `'${formattedDateCurrent}'`,
        dateTo: `'${formattedNextMonthCurrent}'`,
        dateYearAgoFrom: `'${formattedPreviousDateStart}'`,
        dateYearAgoTo: `'${formattedNextMonthPreviousStart}'`,
        dateThreeMonthsAgoFrom: `'${formattedThreeMonthsAgoStart}'`,
        dateThreeMonthsAgoTo: `'${formattedThreeMonthsAgoEnd}'`
      };
    
      const queryString = new URLSearchParams(queryParams).toString();
      const urlQuery = `${endpoint}?${queryString}`;
    
      const response = await this.makeAuthorizedRequest('GET', urlQuery);
    
      const result: SalesQuantityKeeperAlertLineDto[] = [];
    
      response.value.forEach((itemRec: any) => {
        const alertLine: SalesQuantityKeeperAlertLineDto = {
          sku: itemRec.ItemCode,
          productDescription: itemRec.ItemDescription,
          sumPreviousMonthCurrentYear: itemRec.Quantity,
          sumPreviousMonthPreviousYear: itemRec.YearAgoQuantity,
          averageLastThreeMonths: itemRec.ThreeMonthAvgQuantity
        };
    
        result.push(alertLine);
      });
    
      return result;
    }

    async GetPriceOnline(userExtId: string, sku: string | string[], priceListNumber: string | string[]): Promise<PriceDto[]> {
        return []
    }

    async ProductsImBuy(userExtId: string): Promise<string[]> {
        const endpoint = "/Invoices";
        const queryParams = {
          '$filter': `CardCode eq '${userExtId}'`,
          '$select': 'DocumentLines',
        };

        const queryString = new URLSearchParams(queryParams).toString();
        const urlQuery = `${endpoint}?${queryString}`;

        const response = await this.makeAuthorizedRequest('GET', urlQuery);

        const result: string[] = [];

        response.value.forEach((itemRec: any) => {
          itemRec.DocumentLines.forEach((subItem: any) => {
            result.push(subItem.ItemCode);
          });
        });

        const uniqueResult = [...new Set(result)];

        return uniqueResult;
    }
    
    async GetVariety(): Promise<string[]> {
      return []
    }
}