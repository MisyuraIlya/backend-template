import { History } from "src/modules/history/entities/history.entity";
import { AgentStatisticDto } from "../dto/agentStatistic.dto";
import { BonusDto } from "../dto/bonusItem.dto";
import { CategoryDto } from "../dto/category.dto";
import { DocumentItemsDto } from "../dto/documentItems.dto";
import { DocumentsDto } from "../dto/documents.dto";
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
import axios from 'axios';
import { WarehousesItemDetailedDto } from "../dto/warehouse.dto";

export class Priority implements CoreInterface, CronInterface, OnlineInterface {

    private username: string;
    private password: string;
    private url: string;


    constructor(erp: IErpCredentials) {
        this.username = erp.username;
        this.password = erp.password;
        this.url = erp.url;
    }
    
    async GetRequest(query?: string): Promise<any> {
        try {
            console.log(`${this.url}${query || ''}`)
            const response = await axios.get(`${this.url}${query || ''}`, {
                auth: {
                    username: this.username,
                    password: this.password,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 600000, 
            });
            return response.data.value;
        } catch (error) {
            console.error('Error making GET request:', error);
            throw new Error('Failed to fetch data');
        }
    }

    async PostRequest(obj: object, table: string): Promise<any> {
        try {
            const response = await axios.post(`${this.url}${table}`, obj, {
                auth: {
                    username: this.username,
                    password: this.password,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 60000, 
            });

            return response.data; 

        } catch (error) {
            console.error('An unexpected error occurred:', error);
            throw new Error('An error occurred while making the POST request');
        }
    }

    async PatchRequest(obj: object, table: string): Promise<any> {
        try {
            const response = await axios.patch(`${this.url}${table}`, obj, {
                auth: {
                    username: this.username,
                    password: this.password,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 60000, 
            });
            const content = response.data;
            return content;

        } catch (error) {
            console.error('An unexpected error occurred:', error);
            throw new Error('An error occurred while making the PATCH request');
        }
    }

    async GetCategories(): Promise<CategoryDto[]> {
        const data = await this.GetRequest('/FAMILYTYPES');
        const result = [] as CategoryDto[];

        data.forEach((itemRec: any) => {
            if (itemRec.FTNAME) {
                const obj: CategoryDto = {
                    categoryId: itemRec.FTCODE,
                    categoryName: itemRec.FTNAME,
                };
                result.push(obj);
            }
        });

        return result;
    }

    async GetProducts(pageSize?: number, skip?: number): Promise<ProductDto[]> {
        const endpoint = "/LOGPART";
        const params: Record<string, any> = {};

        if (pageSize != null) {
          params['$top'] = pageSize;
          params['$skip'] = skip ?? 0;
        }

        const qs = new URLSearchParams(params).toString();
        const url = `${endpoint}?${qs}`;

        try {
          const raw = await this.GetRequest(url);
          console.log('raw',raw.length)
          return raw
            .map((r: any) => {
              const dto: ProductDto = {
                sku: r.PARTNAME,
                title: r.PARTDES,
                barcode: r.BARCODE,
                packQuantity: r.CONV,
                categoryLvl1Id: r.SPEC14,
                categoryLvl1Name: r.SPEC14,
                categoryLvl2Id: r.FBAO_PARAMETERCODEA,
                categoryLvl2Name: r.FBAO_PARAMETERCODEA,
                categoryLvl3Id: r.FBAO_FAMILYCODE,
                categoryLvl3Name: r.FBAO_FAMILYCODE,
                status: r.STATDES === 'פעיל',
                baseprice: r.BASEPLPRICE,
                minimumPrice: r.MINPRICE,
                Extra2: r.SPEC2,
                Extra3: r.SPEC3,
                Extra4: r.SPEC4,
                Extra5: r.SPEC5,
                Extra6: r.SPEC6,
                Extra7: r.SPEC7,
                Extra8: r.SPEC8,
                Extra10: r.FBAO_PARAMETERCODEA,
                Extra11: r.FBAO_PARAMETERCODEA,
                Extra12: r.FBAO_PARAMETERCODEB,
                Extra13: r.FBAO_PARAMETERCODEB,
                Extra14: r.FBAO_PARAMETERCODEC,
                Extra15: r.FBAO_PARAMETERCODEC,
                Extra16: r.FBAO_PARAMETERCODED,
                Extra17: r.FBAO_PARAMETERCODED,
                Extra18: r.FBAO_PARAMETERCODEE,
                Extra19: r.FBAO_PARAMETERCODEE,
                Extra20: r.FBAO_PARAMETERCODEF,
                Extra21: r.FBAO_PARAMETERCODEF,
                Extra22: r.FBAO_PARAMETERCODEG,
                Extra23: r.FBAO_PARAMETERCODEG,
                intevntory_managed: true,
              };
              return (
                dto.categoryLvl1Id && dto.categoryLvl1Name &&
                dto.categoryLvl2Id && dto.categoryLvl2Name &&
                dto.categoryLvl3Id && dto.categoryLvl3Name
              ) ? dto : null;
            })
            
        } catch(e) {
          console.log('[ERROR]', e)
          throw new Error('Failed to fetch products');
        }
    }
      

    async GetUsers(): Promise<UserDto[]> {
      const endpoint = "/CUSTOMERS";
      const queryExtras = {
        '$expand': "CUSTPERSONNEL_SUBFORM",
      };
      const urlQuery = `${endpoint}?${new URLSearchParams(queryExtras).toString()}`;

      try {
        const response = await this.GetRequest(urlQuery);

        const users: UserDto[] = response.map((userRec: any) => {
          const userDto: UserDto = {
            userExId:        userRec.CUSTNAME,
            userDescription: userRec.CUSTDES,
            name:            userRec.CUSTDES,
            phone:       userRec.PHONE,
            isBlocked:       userRec.INACTIVEFLAG === 'Y',
            address:         userRec.ADDRESS,
            town:            userRec.STATE,
            payCode:         userRec.PAYCODE,
            payDes:          userRec.PAYDES,
            maxCredit:       Number(userRec.MAX_CREDIT),
            maxObligo:       Number(userRec.MAX_OBLIGO),
            hp:              userRec.WTAXNUM,
            taxCode:         userRec.TAXCODE,
            agentCode:       userRec.AGENTCODE,

            // These three were missing before:
            globalDiscount:  Number(userRec.GLOBAL_DISCOUNT ?? 0),
            isVatEnabled:    userRec.VATFLAG === 'Y',
            salesCurrency:   userRec.SALESCURRENCY ?? '',

            // initialize, then fill below
            subUsers:        []
          };

          // Expand sub‐users if present
          if (Array.isArray(userRec.CUSTPERSONNEL_SUBFORM)) {
            userDto.subUsers = userRec.CUSTPERSONNEL_SUBFORM.map((subRec: any) => ({
              userExId:        userRec.CUSTNAME,
              userDescription: userRec.CUSTDES,
              name:            subRec.NAME,
              telephone:       subRec.CELLPHONE,
              isBlocked:       userRec.INACTIVEFLAG === 'Y',
              address:         userRec.ADDRESS,
              town:            userRec.STATE,
              payCode:         userRec.PAYCODE,
              payDes:          userRec.PAYDES,
              maxCredit:       Number(userRec.MAX_CREDIT),
              maxObligo:       Number(userRec.MAX_OBLIGO),
              hp:              userRec.WTAXNUM,
              taxCode:         userRec.TAXCODE,
              agentCode:       userRec.AGENTCODE,
              globalDiscount:  Number(userRec.GLOBAL_DISCOUNT ?? 0),
              isVatEnabled:    userRec.VATFLAG === 'Y',
              salesCurrency:   userRec.SALESCURRENCY ?? '',
              subUsers:        []
            }));
          }

          return userDto;
        });

        return users;

      } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
      }
    }

    async FindUser({
      userExtId,
      phone
    }: {
      userExtId: string;
      phone?: string;
    }): Promise<UserDto> {
        const endpoint = "/CUSTOMERS";
        // build filter string
        const filters = [`CUSTNAME eq '${userExtId}'`];
        if (phone) {
          filters.push(`PHONE eq '${phone}'`);
        }
      
        const queryExtras = {
          '$expand': "CUSTPERSONNEL_SUBFORM",
          '$filter': filters.join(' and ')
        };
        const urlQuery = `${endpoint}?${new URLSearchParams(queryExtras).toString()}`;
      
        try {
          const response = await this.GetRequest(urlQuery);
      
          if (!Array.isArray(response) || response.length === 0) {
            throw new Error(`No user found for CUSTNAME='${userExtId}'${phone ? ` and PHONE='${phone}'` : ''}`);
          }
      
          const userRec = response[0];
          const userDto: UserDto = {
            userExId:        userRec.CUSTNAME,
            userDescription: userRec.CUSTDES,
            name:            userRec.CUSTDES,
            phone:           userRec.PHONE,
            isBlocked:       userRec.INACTIVEFLAG === 'Y',
            address:         userRec.ADDRESS,
            town:            userRec.STATE,
            payCode:         userRec.PAYCODE,
            payDes:          userRec.PAYDES,
            maxCredit:       Number(userRec.MAX_CREDIT),
            maxObligo:       Number(userRec.MAX_OBLIGO),
            hp:              userRec.WTAXNUM,
            taxCode:         userRec.TAXCODE,
            agentCode:       userRec.AGENTCODE,
            globalDiscount:  Number(userRec.GLOBAL_DISCOUNT ?? 0),
            isVatEnabled:    userRec.VATFLAG === 'Y',
            salesCurrency:   userRec.SALESCURRENCY ?? '',
            subUsers:        []
          };
      
          if (Array.isArray(userRec.CUSTPERSONNEL_SUBFORM)) {
            userDto.subUsers = userRec.CUSTPERSONNEL_SUBFORM.map((subRec: any) => ({
              userExId:        userRec.CUSTNAME,
              userDescription: userRec.CUSTDES,
              name:            subRec.NAME,
              phone:           subRec.CELLPHONE,
              isBlocked:       userRec.INACTIVEFLAG === 'Y',
              address:         userRec.ADDRESS,
              town:            userRec.STATE,
              payCode:         userRec.PAYCODE,
              payDes:          userRec.PAYDES,
              maxCredit:       Number(userRec.MAX_CREDIT),
              maxObligo:       Number(userRec.MAX_OBLIGO),
              hp:              userRec.WTAXNUM,
              taxCode:         userRec.TAXCODE,
              agentCode:       userRec.AGENTCODE,
              globalDiscount:  Number(userRec.GLOBAL_DISCOUNT ?? 0),
              isVatEnabled:    userRec.VATFLAG === 'Y',
              salesCurrency:   userRec.SALESCURRENCY ?? '',
              subUsers:        []
            }));
          }
      
          return userDto;
      
        } catch (error) {
          console.error('Error finding user:', error);
          throw new Error('Failed to find user');
        }
    }



    async GetVariety(): Promise<string[]> {
        // Implement the logic here
        return []
    }

    async GetPriceList(): Promise<PriceListDto[]> {
        const endpoint = "/PRICELIST";
      
        try {
          const response = await this.GetRequest(endpoint);
      
          const priceLists: PriceListDto[] = response.map((itemRec: any) => {
            const obj: PriceListDto = {
              priceListExtId: itemRec['PLNAME'],
              priceListTitle: itemRec['PLDES'],
              priceListExperationDate: itemRec['PLDATE'],
            };
      
            return obj;
          });
      
          return priceLists;
        } catch (error) {
          console.error('Error fetching price list:', error);
          throw new Error('Failed to fetch price list');
        }
    }

    async GetPriceListUser(): Promise<PriceListUserDto[]> {
        const endpoint = "/CUSTOMERS";
        const queryExtras = {
          '$expand': "CUSTPLIST_SUBFORM"
        };
      
        const queryString = new URLSearchParams(queryExtras).toString();
        const urlQuery = `${endpoint}?${queryString}`;
      
        try {
          const response = await this.GetRequest(urlQuery);
      
          const priceListUsers: PriceListUserDto[] = [];
      
          response.forEach((itemRec: any) => {
            if (itemRec['CUSTPLIST_SUBFORM']) {
              itemRec['CUSTPLIST_SUBFORM'].forEach((subRec: any) => {
                if (itemRec['CUSTNAME']) {
                  const userDto: PriceListUserDto = {
                    userExId: itemRec['CUSTNAME'],
                    priceListExId: subRec['PLNAME'],
                  };
      
                  priceListUsers.push(userDto);
                }
              });
            }
          });
      
          return priceListUsers;
        } catch (error) {
          console.error('Error fetching price list user:', error);
          throw new Error('Failed to fetch price list user');
        }
    }

    async GetPriceListDetailed(): Promise<PriceListDetailedDto[]> {
        const urlQuery = '/PRICELIST?$expand=PARTPRICE2_SUBFORM($select=PARTNAME,PRICE,PERCENT)';
      
        try {
          const response = await this.GetRequest(urlQuery);
      
          const priceListsDetailed: PriceListDetailedDto[] = [];
      
          response.forEach((itemRec: any) => {
            if (itemRec['PARTPRICE2_SUBFORM']) {
              itemRec['PARTPRICE2_SUBFORM'].forEach((subRec: any) => {
                const obj: PriceListDetailedDto = {
                  sku: subRec['PARTNAME'],
                  price: subRec['PRICE'],
                  priceList: itemRec['PLNAME'],
                  discount: subRec['PERCENT'],
                };
      
                priceListsDetailed.push(obj);
              });
            }
          });
      
          return priceListsDetailed;
        } catch (error) {
          console.error('Error fetching price list detailed:', error);
          throw new Error('Failed to fetch price list detailed');
        }
    }

    async GetStocks(): Promise<StockDto[]> {
        const endpoint = "/LOGPART";
        const queryExtras = {
          '$expand': "LOGCOUNTERS_SUBFORM"
        };
      
        const queryString = new URLSearchParams(queryExtras).toString();
        const urlQuery = `${endpoint}?${queryString}`;
      
        try {
          const response = await axios.get(urlQuery);
      
          const stocks: StockDto[] = [];
      
          response.data.forEach((itemRec: any) => {
            if (itemRec['LOGCOUNTERS_SUBFORM']) {
              itemRec['LOGCOUNTERS_SUBFORM'].forEach((subRec: any) => {
                const obj: StockDto = {
                  sku: itemRec['PARTNAME'],
                  stock: subRec['BALANCE'],
                  warehouse: subRec['WAREHOUSE'], // Assuming 'WAREHOUSE' is part of the response
                };
      
                stocks.push(obj);
              });
            }
          });
      
          return stocks;
        } catch (error) {
          console.error('Error fetching stocks:', error);
          throw new Error('Failed to fetch stocks');
        }
    }

    async  GetBonuses(): Promise<BonusDto[]> {
        const endpoint = "/CUSTOMERS";
        const queryExtras = {
          '$select': 'CUSTNAME',
          '$expand': "CUSTFAMILYBONUSES_SUBFORM,CUSTBONUSES_SUBFORM"
        };
      
        const queryString = new URLSearchParams(queryExtras).toString();
        const urlQuery = `${endpoint}?${queryString}`;
      
        try {
          const response = await axios.get(urlQuery);
      
          const bonuses: BonusDto[] = [];
      
          for (const itemRec of response.data) {
            if (itemRec['CUSTFAMILYBONUSES_SUBFORM']) {
              for (const subRec of itemRec['CUSTFAMILYBONUSES_SUBFORM']) {
                const family = subRec['FAMILYNAME'];
                const endpointProd = "/LOGPART";
                const queryExtrasProd = {
                  '$filter': `FAMILYNAME eq '${family}'`,
                  '$select': 'PARTNAME',
                };
      
                const queryStringProd = new URLSearchParams(queryExtrasProd).toString();
                const urlQueryProd = `${endpointProd}?${queryStringProd}`;
      
                const responseProds = await axios.get(urlQueryProd);
      
                for (const prodRec of responseProds.data) {
                  const obj: BonusDto = {
                    sku: prodRec['PARTNAME'],
                    userExtId: itemRec['CUSTNAME'],
                    bonusSku: subRec['BONUSPARTNAME'],
                    bonusQuantity: subRec['BONUSQUANT'],
                    minimumQuantity: subRec['MINQUANT'],
                    title: subRec['FAMILYDES'],
                    fromDate: subRec['FROMDATE'],
                    expiredAt: subRec['TODATE'],
                    extId: subRec['FAMILYNAME'],
                  };
      
                  bonuses.push(obj);
                }
              }
            }
          }
      
          return bonuses;
        } catch (error) {
          console.error('Error fetching bonuses:', error);
          throw new Error('Failed to fetch bonuses');
        }
    }
      

    async GetAgents(): Promise<UserDto[]> {
        const endpoint = '/AGENTS';
      
        try {
          const response = await this.GetRequest(endpoint);
          const users: UserDto[] = response.map((userRec: any) => {
            const user: UserDto = {
              userExId: userRec['AGENTCODE'],
              name: userRec['AGENTNAME'],
              phone: userRec['CELLPHONE'],
              isBlocked: userRec['INACTIVE'] === 'Y',
              subUsers: [], 
            };
      
            return user;
          });
          return users;
        } catch (error) {
          console.error('Error fetching users:', error);
          throw new Error('Failed to fetch users');
        }
    }

    async SendOrder(history: History): Promise<string> {
        let response: any;
      
        if (history.documentType === HistoryDocumentTypeEnum.ORDER) {
          response = await this.SendOrderTemplate(history);
        } else if (history.documentType === HistoryDocumentTypeEnum.QUOTE) {
          response = await this.SendQuoteTemplate(history);
        } else if (history.documentType === HistoryDocumentTypeEnum.RETURN) {
          response = await this.SendReturnTemplate(history);
        } else {
          throw new Error('Document type not found');
        }
      
        return response;
      }
      
    private async SendOrderTemplate(history: History): Promise<string> {
        const obj: any = {};
        obj.CUSTNAME = history.user.extId;
        obj.DUEDATE = history.deliveryDate ? history.deliveryDate.toISOString() : history.createdAt.toISOString();
      
        const lines: any = { lines: [] };
        history.historyDetaileds.forEach(itemRec => {
          const objLine: any = {};
          objLine.PARTNAME = itemRec.product.sku;
          objLine.TQUANT = itemRec.quantity;
          objLine.PRICE = itemRec.singlePrice;
          lines.lines.push(objLine);
        });
      
        obj.ORDERITEMS_SUBFORM = lines.lines;
      
        const response = await axios.post('/ORDERS', obj);
      
        if (response.data['ORDNAME']) {
          return response.data['ORDNAME'];
        } else {
          throw new Error('Order not transmitted');
        }
      }
      
    private async SendQuoteTemplate(history: History): Promise<string> {
        const obj: any = {};
        obj.CUSTNAME = history.user.extId;
        obj.PDATE = history.createdAt.toISOString();
      
        const lines: any = { lines: [] };
        history.historyDetaileds.forEach(itemRec => {
          const objLine: any = {};
          objLine.PARTNAME = itemRec.product.sku;
          objLine.TQUANT = itemRec.quantity;
          objLine.PRICE = itemRec.singlePrice;
          lines.lines.push(objLine);
        });
      
        obj.CPROFITEMS_SUBFORM = lines.lines;
      
        const response = await axios.post('/CPROF', obj);
      
        if (response.data['CPROFNUM']) {
          return response.data['CPROFNUM'];
        } else {
          throw new Error('Quote not transmitted');
        }
      }
      
    private async SendReturnTemplate(history: History): Promise<string> {
        const obj: any = {};
        obj.CUSTNAME = history.user.extId;
      
        const lines: any = { lines: [] };
        history.historyDetaileds.forEach(itemRec => {
          const objLine: any = {};
          objLine.PARTNAME = itemRec.product.sku;
          objLine.TQUANT = itemRec.quantity
          objLine.PRICE = itemRec.total;
          lines.lines.push(objLine);
        });
      
        obj.TRANSORDER_N_SUBFORM = lines.lines;
      
        const response = await axios.post('/DOCUMENTS_N', obj);
      
        if (response.data['DOCNO']) {
          return response.data['DOCNO'];
        } else {
          throw new Error('Return document not transmitted');
        }
    }

    async GetDocuments(dateFrom: Date, dateTo: Date, documentsType: string, pageSize: number, currentPage: number, user?: any, search?: string): Promise<DocumentsDto> {
        // Implement the logic here
        return (
          {
            documents: [],
            totalRecords: 0,
            totalPages: 0,
            currentPage:0,
            pageSize: 0,
          }
        )
    }

    async GetDocumentsItem(documentNumber: string, documentType: string, userExId?: string): Promise<DocumentItemsDto> {
        // Implement the logic here
        return {
          products:[],
          totalTax:0,
          totalPriceAfterTax:0,
          totalAfterDiscount:0,
          totalPrecent:0,
          documentType:'',
          comment:'',
          base64Pdf:'',
          files:[]
        }
    }

    async GetCartesset(userExId: string, dateFrom: Date, dateTo: Date): Promise<dynamicTableDto> {
        const endpoint = "/ACCOUNTS_RECEIVABLE";
        const formattedDateFrom = dateFrom.toISOString(); 
        const formattedDateTo = dateTo.toISOString(); 
    
        const queryParameters = {
            '$filter': `ACCNAME eq '${userExId}'`,
            '$expand': `ACCFNCITEMS2_SUBFORM($filter=BALDATE ge '${formattedDateFrom}' and BALDATE le '${formattedDateTo}')`
        };
    
        const queryString = new URLSearchParams(queryParameters).toString();
        const urlQuery = `${endpoint}?${queryString}`;
    
        try {
            const response = await axios.get(urlQuery);
            const result: dynamicTableDto = {
                columns: [
                    'תאריך',
                    'ת.למאזן',
                    'מס תנועה',
                    'אסמכתא',
                    'סוג תנועה',
                    'פרטים',
                    'חובה',
                    'זכות',
                    'יתרה'
                ],
                columnsEnglish: [
                    'Date',
                    'Balance Date',
                    'Transaction Number',
                    'Reference',
                    'Transaction Type',
                    'Details',
                    'Debit',
                    'Credit',
                    'Balance'
                ],
                lines: []
            };
    
            response.data.forEach((itemRec: any) => {
                itemRec['ACCFNCITEMS2_SUBFORM'].forEach((subRec: any) => {
                    const arr = [
                        subRec['CURDATE'],
                        subRec['BALDATE'],
                        subRec['FNCNUM'],
                        subRec['TODOREF'],
                        subRec['FNCPATNAME'],
                        subRec['DETAILS'],
                        subRec['DEBIT'],
                        subRec['CREDIT'],
                        subRec['BAL']
                    ];
                    result.lines.push(arr);
                });
            });
    
            return result;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw new Error('Failed to fetch cartesset data');
        }
    }

    async GetDebit(userExId: string, dateFrom: Date, dateTo: Date): Promise<dynamicTableDto> {
        const endpoint = "/ACCOUNTS_RECEIVABLE";
        const formattedDateFrom = dateFrom.toISOString(); 
        const formattedDateTo = dateTo.toISOString(); 
    
        const queryParameters = {
            '$filter': `ACCNAME eq '${userExId}'`,
            '$expand': `ARFNCITEMS3_SUBFORM($filter=BALDATE ge '${formattedDateFrom}' and BALDATE le '${formattedDateTo}')`
        };
    
        const queryString = new URLSearchParams(queryParameters).toString();
        const urlQuery = `${endpoint}?${queryString}`;
    
        try {
            const response = await axios.get(urlQuery); 
            const result: dynamicTableDto = {
                columns: [
                    'תאריך',
                    'מסמך',
                    'חובה',
                    'יתרה',
                    'תאריך תשלום'
                ],
                columnsEnglish: [
                    'Date',
                    'Document Number',
                    'Debit',
                    'Line Sum',
                    'Payment Date'
                ],
                lines: []
            };
    
            response.data.forEach((itemRec: any) => {
                let sum = 0;
                itemRec['ARFNCITEMS3_SUBFORM'].forEach((subRec: any) => {
                    const obj = {
                        createdAt: subRec['CURDATE'],
                        documentNumber: subRec['IVNUM'],
                        debit: subRec['DEBIT1'],
                        lineSum: sum += subRec['DEBIT1'],
                        payDate: subRec['FNCDATE']
                    };
                    result.lines.push(obj);
                });
                // result.total = sum; 
            });
    
            return result;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw new Error('Failed to fetch debit data');
        }
    }

    async PurchaseHistoryByUserAndSku(userExtId: string, sku: string): Promise<PurchaseHistoryItem[]> {
        const endpoint = "/ORDERS";
        const queryParameters = new URLSearchParams({
            '$filter': `CUSTNAME eq '${userExtId}'`,
            '$select': 'ORDNAME,CURDATE',
            '$expand': `ORDERITEMS_SUBFORM($select=PARTNAME,TQUANT,PRICE,VPRICE,PERCENT,QPRICE,VATPRICE;$filter=PARTNAME eq '${sku}')`,
            '$top': '200'
        });
        const urlQuery = `${endpoint}?${queryParameters.toString()}`;
    
        try {
            const response = await fetch(urlQuery);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            const result: PurchaseHistoryItem[] = [];
    
            for (const itemRec of data) {
                for (const subRec of itemRec.ORDERITEMS_SUBFORM) {
                    const obj: PurchaseHistoryItem = {
                        documentNumber: itemRec.ORDNAME,
                        date: itemRec.CURDATE,
                        quantity: subRec.TQUANT,
                        price: subRec.PRICE,
                        vatPrice: subRec.VPRICE,
                        discount: subRec.PERCENT,
                        totalPrice: subRec.QPRICE,
                        vatTotal: subRec.VATPRICE
                    };
                    result.push(obj);
                }
            }
            return result;
    
        } catch (error) {
            console.error('Error fetching purchase history:', error);
            return [];
        }
    }

    async GetAgentStatistic(
      agentId: string,
      dateFrom: string,
      dateTo: string
    ): Promise<AgentStatisticDto> {
      const endpoint = "/ORDERS";
      const now = new Date();

      // --- parse dateFrom / dateTo or default to start/end of year ---
      let dateFromParsed = dateFrom
        ? new Date(dateFrom)
        : new Date(now.getFullYear(), 0, 1);
      let dateToParsed = dateTo
        ? new Date(dateTo)
        : new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

      const dateFromFormatted = dateFromParsed.toISOString();
      const dateToFormatted = dateToParsed.toISOString();

      const qp = new URLSearchParams({
        "$filter": `AGENTCODE eq '${agentId}' and CURDATE ge ${dateFromFormatted} and CURDATE le ${dateToFormatted}`,
        "$select": "QPRICE,CURDATE",
      });
      const urlQuery = `${endpoint}?${qp.toString()}`;

      try {
        const res = await fetch(urlQuery);
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        const data: Array<{ QPRICE: string; CURDATE: string }> = await res.json();

        // initialize everything to number (no undefined/null)
        const result: AgentStatisticDto = {
          monthlyTotals: [],
          totalPriceToday: 0,
          totalInvoicesToday: 0,
          totalPriceMonth: 0,
          totalInvoicesMonth: 0,
          totalPriceChoosedDates: 0,
          totalInvoicesChoosedDates: 0,
          averageTotalBasketToday: 0,
          averageTotalBasketMonth: 0,
          averageTotalBasketChoosedDates: 0,
        };

        // prep months map, e.g. "2025-01" → 0, ...
        const monthlyTotalsMap: Record<string, number> = {};
        for (let m = 1; m <= 12; m++) {
          const key = `${now.getFullYear()}-${String(m).padStart(2, "0")}`;
          monthlyTotalsMap[key] = 0;
        }

        const todayKey = now.toISOString().slice(0, 10);   // "YYYY-MM-DD"
        const monthKey = now.toISOString().slice(0, 7);    // "YYYY-MM"

        let totalBasketsAcrossDates = 0;

        data.forEach(({ QPRICE, CURDATE }) => {
          const price = parseFloat(QPRICE) || 0;

          // 1) chosen‐dates totals
          result.totalPriceChoosedDates = (result.totalPriceChoosedDates ?? 0) + price;
          result.totalInvoicesChoosedDates = (result.totalInvoicesChoosedDates ?? 0) + 1;
          totalBasketsAcrossDates++;

          // 2) monthly map
          const d = new Date(CURDATE);
          const mapKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          monthlyTotalsMap[mapKey] = (monthlyTotalsMap[mapKey] ?? 0) + price;

          // 3) today’s totals
          if (CURDATE.startsWith(todayKey)) {
            result.totalPriceToday = (result.totalPriceToday ?? 0) + price;
            result.totalInvoicesToday = (result.totalInvoicesToday ?? 0) + 1;
          }

          // 4) this month’s totals
          if (CURDATE.startsWith(monthKey)) {
            result.totalPriceMonth = (result.totalPriceMonth ?? 0) + price;
            result.totalInvoicesMonth = (result.totalInvoicesMonth ?? 0) + 1;
          }
        });

        // build monthlyTotals array with Hebrew month names
        const hebrewMonths: Record<number, string> = {
          1: "ינואר", 2: "פברואר", 3: "מרץ", 4: "אפריל",
          5: "מאי", 6: "יוני", 7: "יולי", 8: "אוגוסט",
          9: "ספטמבר", 10: "אוקטובר", 11: "נובמבר", 12: "דצמבר",
        };
        result.monthlyTotals = Object.entries(monthlyTotalsMap).map(
          ([ym, tot]) => {
            const [, mm] = ym.split("-");
            const mNum = parseInt(mm, 10);
            return {
              month: mNum,
              total: +tot.toFixed(2),
              monthTitle: hebrewMonths[mNum],
            };
          }
        );

        // compute averages (guard against division by zero)
        result.averageTotalBasketChoosedDates =
          totalBasketsAcrossDates > 0
            ? result.totalPriceChoosedDates!/ totalBasketsAcrossDates
            : 0;

        result.averageTotalBasketToday =
          (result.totalInvoicesToday ?? 0) > 0
            ? result.totalPriceToday!/ result.totalInvoicesToday!
            : 0;

        result.averageTotalBasketMonth =
          (result.totalInvoicesMonth ?? 0) > 0
            ? result.totalPriceMonth!/ result.totalInvoicesMonth!
            : 0;

        return result;
      } catch (error) {
        console.error("Error fetching agent statistics:", error);
        throw error;
      }
    }


    async SalesKeeperAlert(userExtId: string): Promise<SalesKeeperAlertDto> {
        const endpoint1 = "/AINVOICES";
        const queryParams1 = new URLSearchParams({
          '$filter': `CUSTNAME eq '${userExtId}'`,
          '$select': 'TOTPRICE,IVDATE'
        });
        const url1 = `${endpoint1}?${queryParams1.toString()}`;
      
        const endpoint2 = "/CINVOICES";
        const queryParams2 = new URLSearchParams({
          '$filter': `CUSTNAME eq '${userExtId}'`,
          '$select': 'TOTPRICE,IVDATE'
        });
        const url2 = `${endpoint2}?${queryParams2.toString()}`;
      
        try {
          // Fetch data from both endpoints concurrently
          const [response1, response2] = await Promise.all([fetch(url1), fetch(url2)]);
      
          if (!response1.ok || !response2.ok) {
            throw new Error('Network response was not ok');
          }
      
          const data1 = await response1.json();
          const data2 = await response2.json();
      
          // Combine the responses from both endpoints
          const data = [...data1, ...data2];
      
          // Get the current year and month
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1;
          const previousMonth = currentMonth - 1 > 0 ? currentMonth - 1 : 12;
          const previousMonthYear = currentMonth - 1 > 0 ? currentYear : currentYear - 1;
          const previousYear = currentYear - 1;
      
          // Initialize variables for summing values
          let sumCurrentPrevMonth = 0;
          let sumPreviousYearPrevMonth = 0;
          const lastThreeMonthsPrices: number[] = [];
      
          // Process the data
          for (const item of data) {
            const date = new Date(item.IVDATE);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // JavaScript months are 0-indexed
            const totPrice = parseFloat(item.TOTPRICE);
      
            // Sum for the previous month of the current year
            if (year === currentYear && month === previousMonth) {
              sumCurrentPrevMonth += totPrice;
            }
      
            // Sum for the previous month of the previous year
            if (year === previousYear && month === previousMonth) {
              sumPreviousYearPrevMonth += totPrice;
            }
      
            // Collect prices for the last 3 months
            const monthDiff = (currentYear - year) * 12 + (currentMonth - month);
            if (monthDiff >= 1 && monthDiff <= 3) {
              lastThreeMonthsPrices.push(totPrice);
            }
          }
      
          // Calculate the average of the last 3 months
          const averageLastThreeMonths =
            lastThreeMonthsPrices.length > 0
              ? lastThreeMonthsPrices.reduce((sum, price) => sum + price, 0) / lastThreeMonthsPrices.length
              : 0;
      
          // Prepare the result
          const result: SalesKeeperAlertDto = {
            sumPreviousMonthCurrentYear: sumCurrentPrevMonth,
            sumPreviousMonthPreviousYear: sumPreviousYearPrevMonth,
            averageLastThreeMonths: averageLastThreeMonths,
          };
      
          return result;
      
        } catch (error) {
          console.error('Error fetching sales keeper alert data:', error);
          throw error; // Re-throw the error for further handling or notification
        }
    }

    async SalesQuantityKeeperAlert(userExtId: string): Promise<SalesQuantityKeeperAlertLineDto[]> {
        // Endpoint 1: AINVOICES
        const endpoint1 = "/AINVOICES";
        const queryParams1 = new URLSearchParams({
          '$filter': `CUSTNAME eq '${userExtId}'`,
          '$select': 'IVDATE,IVNUM,DEBIT,IVTYPE',
          '$expand': 'AINVOICEITEMS_SUBFORM($select=PARTNAME,TQUANT,PDES)',
        });
        const url1 = `${endpoint1}?${queryParams1.toString()}`;
      
        // Endpoint 2: CINVOICES
        const endpoint2 = "/CINVOICES";
        const queryParams2 = new URLSearchParams({
          '$filter': `CUSTNAME eq '${userExtId}'`,
          '$select': 'IVDATE,IVNUM,DEBIT,IVTYPE',
          '$expand': 'CINVOICEITEMS_SUBFORM($select=PARTNAME,TQUANT,PDES)',
        });
        const url2 = `${endpoint2}?${queryParams2.toString()}`;
      
        try {
          // Fetch data from both endpoints concurrently
          const [response1, response2] = await Promise.all([fetch(url1), fetch(url2)]);
      
          if (!response1.ok || !response2.ok) {
            throw new Error('Network response was not ok');
          }
      
          const data1 = await response1.json();
          const data2 = await response2.json();
      
          // Combine the responses from both endpoints
          const data = [...data1, ...data2];
      
          // Get the current date details
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1;
          const previousMonth = currentMonth - 1 > 0 ? currentMonth - 1 : 12;
          const previousYear = currentYear - 1;
      
          // Initialize results storage
          const results: { [key: string]: any } = {};
      
          // Process the invoices and their items
          for (const invoice of data) {
            const invoiceDate = new Date(invoice.IVDATE);
            const year = invoiceDate.getFullYear();
            const month = invoiceDate.getMonth() + 1; // JavaScript months are 0-indexed
      
            // Process AINVOICEITEMS_SUBFORM or CINVOICEITEMS_SUBFORM depending on the endpoint
            const items = invoice.AINVOICEITEMS_SUBFORM || invoice.CINVOICEITEMS_SUBFORM;
      
            if (!items) {
              continue; // If no subform exists, skip this invoice
            }
      
            for (const item of items) {
              const partName = item.PARTNAME;
              const tQuant = parseFloat(item.TQUANT);
              const productDescription = item.PDES || ''; // Product description
      
              if (!results[partName]) {
                results[partName] = {
                  sumPreviousMonthCurrentYear: 0,
                  sumPreviousMonthPreviousYear: 0,
                  lastThreeMonths: [],
                  productDescription,
                };
              }
      
              // Sum for previous month of current year
              if (year === currentYear && month === previousMonth) {
                results[partName].sumPreviousMonthCurrentYear += tQuant;
              }
      
              // Sum for previous month of previous year
              if (year === previousYear && month === previousMonth) {
                results[partName].sumPreviousMonthPreviousYear += tQuant;
              }
      
              // Collect quantities for the last 3 months
              const monthDiff = (currentYear - year) * 12 + (currentMonth - month);
              if (monthDiff >= 1 && monthDiff <= 3) {
                results[partName].lastThreeMonths.push(tQuant);
              }
            }
          }
      
          // Calculate the average of the last 3 months and prepare the result
          const resultLines: SalesQuantityKeeperAlertLineDto[] = [];
          for (const partName in results) {
            const result = results[partName];
            const averageLastThreeMonths =
              result.lastThreeMonths.length > 0
                ? result.lastThreeMonths.reduce((sum, qty) => sum + qty, 0) / result.lastThreeMonths.length
                : 0;
      
            const line: SalesQuantityKeeperAlertLineDto = {
              sku: partName,
              productDescription: result.productDescription,
              averageLastThreeMonths,
              sumPreviousMonthPreviousYear: result.sumPreviousMonthPreviousYear,
              sumPreviousMonthCurrentYear: result.sumPreviousMonthCurrentYear,
            };
      
            resultLines.push(line);
          }
      
          return resultLines;
      
        } catch (error) {
          console.error('Error fetching sales quantity keeper alert data:', error);
          throw error; // Re-throw the error for further handling or notification
        }
    }


    async GetPriceOnline(userExtId: string, sku: string | string[], priceListNumber: string | string[]): Promise<PriceDto[]> {
        // Implement the logic here
        return []
    }

    async GetStockOnline(sku: string | string[], warehouse?: string): Promise<StockDto[]> {
        // Implement the logic here
        return []
    }

    async ProductsImBuy(userExtId: string): Promise<string[]> {
        const endpoint = "/ORDERS";
        const queryParams = new URLSearchParams({
            '$filter': `CUSTNAME eq '${userExtId}'`,
            '$expand': 'ORDERITEMS_SUBFORM($select=PARTNAME)',
            '$top': '20'
        });

        const url = `${endpoint}?${queryParams.toString()}`;

        try {
            // Fetch data from the endpoint
            const response = await fetch(url);
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const result: string[] = [];

            // Iterate through the response and collect PARTNAME values
            for (const itemRec of data) {
            for (const subItem of itemRec.ORDERITEMS_SUBFORM) {
                result.push(subItem.PARTNAME);
            }
            }

            // Get unique PARTNAME values and return as an array
            return Array.from(new Set(result));

        } catch (error) {
            console.error('Error fetching products:', error);
            throw error; // Re-throw the error for further handling or notification
        }
    }

    async ProductsImNotBuy(userExtId: string): Promise<string[]> {
        // Implement the logic here
        return []
    }

    async GetUserProfile(userExtId: string): Promise<dynamicTableDto> {
        const endpoint = "/CUSTOMERS";
        const queryParams = new URLSearchParams({
            '$filter': `CUSTNAME eq '${userExtId}'`,
            '$expand': 'CUSTOBLIGO_SUBFORM'
        });
    
        const url = `${endpoint}?${queryParams.toString()}`;
    
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
    
            const result: dynamicTableDto = {
                columns: [],
                columnsEnglish: [],
                lines: []
            };
    

            return result;
    
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error; // Re-throw the error for further handling or notification
        }
    }

    async GetPurchaseDelivery(string: string): Promise<PurchaseDeliveryItemDto[]> {
        // Implement the logic here
        return []
    }

    async GetWarehouseDetailedBySku(sku: string, warehouses: string[]): Promise<WarehousesItemDetailedDto[]> {
      return []
    }
}