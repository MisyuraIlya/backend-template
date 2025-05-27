import axios from "axios";
import { AgentStatisticDto } from "../dto/agentStatistic.dto";
import { BonusDto } from "../dto/bonusItem.dto";
import { CategoryDto } from "../dto/category.dto";
import { DocumentItemDto, DocumentItemsDto } from "../dto/documentItems.dto";
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
import { WarehousesItemDetailedDto } from "../dto/warehouse.dto";
import { VarietyDto } from "../dto/variety.dto";
import { ProductPackage } from "src/modules/product-package/entities/product.entity";
import { ProductPackageDto } from "../dto/productPackage.dto";

export class Hasavshevet implements CoreInterface, CronInterface, OnlineInterface {
    
    private username: string;
    private password: string;
    private url: string;
    private erpDb: string


    constructor(erp: IErpCredentials) {
        this.username = erp.username;
        this.password = erp.password;
        this.url = erp.url;
        this.erpDb = erp.erpDb
        
    }
    
    
    async GetRequest(query?: string): Promise<any> {
        // Implement the logic here
    }
    
    async PatchRequest(object: any, table: string): Promise<any> {
        // Implement the logic here
    }


    async PostRequest(object: any, table: string): Promise<any> {
        try {
          const response = await axios.post(`${this.url}${table}`, object, {
            headers: {
              'Authorization': `${this.password}`,
              'Content-Type': 'application/json',
            },
            timeout: 60000, 
          });
          return response.data;
        } catch (error) {
          const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
          throw new Error(message);
        }
    }

   

    async GetCategories(): Promise<CategoryDto[]> {
        const requestData = { dbName: this.erpDb, noteIds: ["29"] }; 
        try {
          const response = await this.PostRequest(requestData, '/api/categories');
    
          const categories: CategoryDto[] = [];
    
          response.categoriesAndSubCategories.forEach((category: any) => {
            const obj:CategoryDto = {
              categoryName: category.category,
              englishCategoryName: null,
              categoryId: category.category,
              parentId: null,
              parentName: null,
              lvlNumber: 1,
            }
            categories.push(obj);
            category?.subCategories?.forEach((subCategory: any) => {
              const subObj: CategoryDto = {
                categoryName: subCategory,
                englishCategoryName: null,
                categoryId: subCategory,
                parentId: category.category,
                parentName: category.category,
                lvlNumber: 2,
              };
              categories.push(subObj);
            })
          });
          return categories;
        } catch (error) {
          const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
          throw new Error(message);
        }
    }

    async GetProducts(pageSize?: number, skip?: number): Promise<ProductDto[]> {
        const requestData = {
          dbName: this.erpDb,
          sortGroups: [],
          noteIds: ["29"], 
        ...(pageSize && skip ? { page: String(skip), pageSize: String(pageSize) } : {}),
        };

        try {
        const response = await this.PostRequest(requestData, "/api/products");

        const products: ProductDto[] = [];

        response.products.forEach((product: any) => {
            const parsedCategory = product?.Note ? product.Note.split(' - ') : [];
            const dto: ProductDto = {
              sku: product.ItemKey,
              title: product.ItemName ?? product.ItemKey,
              titleEnglish: product.ForignName,
              barcode: product.BarCode,
              categoryLvl1Id: parsedCategory[0] || null,
              categoryLvl1Name: parsedCategory[0] || null,
              categoryLvl2Id: parsedCategory[1] || null,
              categoryLvl2Name: parsedCategory[1] || null,
              status: true, 
              intevntory_managed: true,
            };

            dto.packages = [];
            response.extraSums?.forEach(element => {
              if (element.KeF == product.ItemKey) {
                dto.packages!.push({
                  sku: element.KeF,
                  quantity: element.SuF
                });
              }
            });

            if(product.ItemKey === '60110'){
              console.log(dto)
            }

            products.push(dto);
        });

        return products;
        } catch (error) {
        const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
        throw new Error(message);
        }
    }

    async GetUsers(): Promise<UserDto[]> {
      const requestData = [
        {
          dbName: this.erpDb,
          sortGroups: Array.from({ length: 21 }, (_, i) => (250 + i).toString()),
        },
        {
          dbName: this.erpDb,
          sortGroups: Array.from({ length: 50 }, (_, i) => (200 + i).toString()),
        },
      ];

      const users: UserDto[] = [];

      for (const element of requestData) {
        try {
          const response = await this.PostRequest(element, '/api/users');

          response.users.forEach((user: any) => {
            const userDto: UserDto = {
              userExId: user.AccountKey,
              name: user.FullName,
              userDescription: user.Details,
              address: user.Address,
              town: user.City,
              phone: user.Phone,
              hp: user.DeductFile,
              maxObligo: user.MaxObligo,
              agentCode: user.Agent,
              isBlocked: false,
              salesCurrency: user.SalesCurrency,
              payCode: user.BalanceCode,
              payDes: user.Balance,
              maxCredit: user.TFtalDiscount,
              taxCode: user.CreditTermsCode,
              isVatEnabled: true,
              subUsers: [],
            };

            response.contacts.forEach((subRec: any) => {
              if (subRec.AccountKey === user.AccountKey) {
                userDto.subUsers.push({
                  userExId: subRec.AccountKey,
                  name: subRec.CName,
                  phone: subRec.CPhone,
                  address: user.Address,
                  town: user.City,
                  userDescription: user.Details,
                  hp: user.DeductFile,
                  maxObligo: user.MaxObligo,
                  agentCode: user.Agent,
                  salesCurrency: user.SalesCurrency,
                  payCode: user.BalanceCode,
                  payDes: user.Balance,
                  maxCredit: user.TFtalDiscount,
                  taxCode: user.CreditTermsCode,
                  isVatEnabled: true,
                  subUsers: [],
                });
              }
            });

            users.push(userDto);
          });
        } catch (error: any) {
          const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
          throw new Error(message);
        }
      }
      return users;
    }


    // @ts-ignore
    async FindUser({ userExtId, phone }: { userExtId: string; phone: string; }): Promise<UserDto> {
      
    }

    async GetVariety(): Promise<VarietyDto[]> {
        const requestData = [
        {
          dbName: this.erpDb,
          sortGroups: Array.from({ length: 21 }, (_, i) => (250 + i).toString()),
        },
        {
          dbName: this.erpDb,
          sortGroups: Array.from({ length: 50 }, (_, i) => (200 + i).toString()),
        },
      ];

      const result: VarietyDto[] = [];

      for (const element of requestData) {
        try {
          const response = await this.PostRequest(element, '/api/varieties-users');

          response.userVarieties.forEach((ele: any) => {
            const userDto: VarietyDto = {
              userExtId: ele.AccountKey,
              sku: ele.ItemKey,
            };
            result.push(userDto);
          });
        } catch (error: any) {
          const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
          throw new Error(message);
        }
      }
      return result;
    }

    async GetPriceList(): Promise<PriceListDto[]> {
        // Implement the logic here
        return []
    }

    async GetPriceListUser(): Promise<PriceListUserDto[]> {
        // Implement the logic here
        return []
    }

    async GetPriceListDetailed(): Promise<PriceListDetailedDto[]> {
        const requestData = {
          dbName: this.erpDb,
          order: 'ASC', 
        };
    
        try {
          const response = await this.PostRequest(requestData, '/api/prices');
          const priceListsDetailed: PriceListDetailedDto[] = [];
    
          response.prices.forEach((priceItem: any) => {
            const priceListDetailedDto: PriceListDetailedDto = {
              sku: priceItem.ItemKey,
              price: priceItem.Price,
              priceList: priceItem.PriceListNumber,
              discount: priceItem.DFlag, 
            };
            priceListsDetailed.push(priceListDetailedDto);
          });
    
          return priceListsDetailed;
        } catch (error) {
          const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
          throw new Error(message);
        }
    }

    async GetStocks(): Promise<StockDto[]> {
        // Implement the logic here
        return []
    }

    async GetBonuses(): Promise<BonusDto[]> {
        // Implement the logic here
        return []
    }

    async GetAgents(): Promise<UserDto[]> {
        const requestData = {
          dbName: this.erpDb,
        };
    
        try {
          const response = await this.PostRequest(requestData, '/api/agents');
          const users: UserDto[] = [];
    
          response.agents.forEach((agent: any) => {
            const user: UserDto = {
              userExId: agent.agent,
              isBlocked: false, 
              subUsers: [] 
            };
            users.push(user);
          });
    
          return users;
        } catch (error) {
          const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
          throw new Error(message);
        }
    }

    async SendOrder(history: any): Promise<string> {
        // Implement the logic here
        return ''
    }

    async GetDocuments(
        dateFrom: Date,
        dateTo: Date,
        documentsType: string,
        pageSize: number,
        currentPage: number,
        userExtId?: string | null,
        search?: string
      ): Promise<DocumentsDto> {
        const requestData: any = {
          dbName: this.erpDb,
          dateFrom: dateFrom.toISOString().split('T')[0], 
          dateTo: dateTo.toISOString().split('T')[0],     
          page: currentPage,
          pageSize: pageSize,
          documentType: documentsType,
          userExtId: userExtId,
          search: search,
        };
    
        try {
          const response = await this.PostRequest(requestData, '/api/documents');
    
          const result: DocumentsDto = {
            documents: [],
            total: response.documentsCount,
            pageCount: response.documentsPages,
            page: currentPage,
            size: pageSize,
          };
    
          response.documents.forEach((document: any) => {
            const dto = {
              userName: document.AccountName,
              userExId: document.AccountKey,
              agentExId: document.Agent,
              total: document.TFtalVat,
              createdAt: document.ValueDate,
              dueDateAt: document.DueDate,
              updatedAt: document.KuDate,
              documentType: document.DocumentID,
              documentNumber: document.DocNumber,
              status: document.Status,
              rehesh: '',  
              agentName: '',  
            };
            result.documents.push(dto);
          });
    
          return result;
        } catch (error) {
          const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
          throw new Error(message);
        }
    }

    async GetDocumentsItem(
      documentNumber: string,
      documentType:   string,
      userExId?:      string
    ): Promise<DocumentItemsDto> {
      const requestData = {
        dbName:       this.erpDb,
        documentId:   documentNumber,
        documentType: documentType,
      };

      try {
        const response = await this.PostRequest(requestData, '/api/documents-items');

        const result: DocumentItemsDto = {
          products:           [],
          files:              [],
          totalTax:            0,
          totalPriceAfterTax:  0,
          totalAfterDiscount:  0,
          totalPrecent:        0,
          documentType:       '',
          comment:            '',
          base64Pdf:          '',
        };

        result.documentType       = response.document.DocumentID;
        result.totalAfterDiscount = response.document.DiscountPrcR;
        result.totalPrecent       = response.document.VatPrc;
        result.totalTax           = response.document.TFtalVatFree;
        result.totalPriceAfterTax = response.document.TFtalVat;
        result.comment            = response.document.Comment    ?? '';
        result.base64Pdf          = response.document.PdfBase64  ?? '';

        response.products.forEach((p: any) => {
          const dto: DocumentItemDto = {
            sku:        p.ItemKey,
            quantity:   p.Quantity,
            title:      p.ItemName,
            priceByOne: p.OPrice,
            total:      p.TFtal,
            discount:   p.DiscountPrc,
            comment:    p.Details,
            product:    null,        
          };
          result.products.push(dto);
        });

        return result;
      } catch (err) {
        const message = err.response
          ? `HTTP error: ${err.response.status} – ${JSON.stringify(err.response.data)}`
          : `Error: ${err.message}`;
        throw new Error(message);
      }
    }

    async GetCartesset(userExId: string, dateFrom: Date, dateTo: Date): Promise<dynamicTableDto> {
        const requestData = {
          dbName: this.erpDb,
          dateFrom: dateFrom.toISOString().split('T')[0], 
          dateTo: dateTo.toISOString().split('T')[0],   
          userExtId: userExId,
        };
    
        try {
          const response = await this.PostRequest(requestData, '/api/cartesset');
    
          const result: dynamicTableDto = {
            columns: [
              'Balance',
              'Batch Number',
              'Description',
              'Due Date',
              'Identifier',
              'Reference 2',
              'Reference',
              'Credit Transaction ID',
              'Transaction ID',
              'Transaction Type',
              'Value Date',
              'Total',
            ],
            columnsEnglish: [
              'Balance',
              'Batch Number',
              'Description',
              'Due Date',
              'Identifier',
              'Reference 2',
              'Reference',
              'Credit Transaction ID',
              'Transaction ID',
              'Transaction Type',
              'Value Date',
              'Total',
            ],
            lines: [],
          };
    
          response.items.forEach((item: any) => {
            const line = {
              Balance: item.Balance,
              BatchNo: item.BatchNo,
              Description: item.Description,
              DueDate: item.DueDate,
              ID: item.ID,
              Ref2: item.Ref2,
              Referance: item.Referance,
              TransCredID: item.TransCredID,
              TransID: item.TransID,
              TransType: item.TransType,
              ValueDate: item.ValueDate,
              suf: item.suF,
            };
    
            result.lines.push(line);
          });
    
          return result;
        } catch (error) {
          const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
          throw new Error(message);
        }
    }

    async GetDebit(userExId: string, dateFrom: Date, dateTo: Date): Promise<dynamicTableDto> {
        const requestData = {
          dbName: this.erpDb,
          dateFrom: dateFrom.toISOString().split('T')[0],
          dateTo: dateTo.toISOString().split('T')[0],
          userExtId: userExId,
        };
    
        try {
          const response = await this.PostRequest(requestData, '/api/debits');
    
          const result: dynamicTableDto = {
            columns: [
              'Balance',
              'Batch Number',
              'Description',
              'Due Date',
              'Identifier',
              'Reference 2',
              'Reference',
              'Credit Transaction ID',
              'Transaction ID',
              'Transaction Type',
              'Value Date',
              'Total',
            ],
            columnsEnglish: [
              'Balance',
              'Batch Number',
              'Description',
              'Due Date',
              'Identifier',
              'Reference 2',
              'Reference',
              'Credit Transaction ID',
              'Transaction ID',
              'Transaction Type',
              'Value Date',
              'Total',
            ],
            lines: [],
          };
    
          let sum = 0;
          response.items.forEach((item: any) => {
            const line = {
              Balance: item.Balance,
              BatchNo: item.BatchNo,
              Description: item.Description,
              DueDate: item.DueDate,
              ID: item.ID,
              Ref2: item.Ref2,
              Referance: item.Referance,
              TransCredID: item.TransCredID,
              TransID: item.TransID,
              TransType: item.TransType,
              ValueDate: item.ValueDate,
              suf: item.suF,
            };
            sum += item.suF;
    
            result.lines.push(line);
          });
    
          // result.total = sum;
    
          return result;
        } catch (error) {
          const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
          throw new Error(message);
        }
    }

    async PurchaseHistoryByUserAndSku(userExtId: string, sku: string): Promise<PurchaseHistoryItem[]> {
        const requestData = {
          dbName: this.erpDb,
          userExtId: userExtId,
          sku: sku,
        };
    
        try {
          const response = await this.PostRequest(requestData, '/api/purchase-history');
    
          const purchaseHistoryItems: PurchaseHistoryItem[] = [];
          response.purchases.forEach((purchase: any) => {
            const purchaseHistoryItem: PurchaseHistoryItem = {
              documentNumber: purchase.DocNumber,
              date: new Date(purchase.ValueDate).toISOString().split('T')[0],  
              quantity: purchase.Quantity,
              price: purchase.Price,
              vatPrice: purchase.TFtal - purchase.Price,
              discount: purchase.DiscountPrc,
              totalPrice: purchase.TFtal,
              vatTotal: purchase.TFtal,
            };
            purchaseHistoryItems.push(purchaseHistoryItem);
          });
    
          return purchaseHistoryItems;
        } catch (error) {
          const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
          throw new Error(message);
        }
    }
    

    async GetAgentStatistic(
      agentId: string,
      dateFrom: string,
      dateTo: string
    ): Promise<AgentStatisticDto> {
      const requestData = {
        dbName: this.erpDb,
        agentId,
        dateFrom,
        dateTo,
      };

      let raw: any = {};
      try {
        raw = await this.PostRequest(requestData, '/api/agent-profile');
      } catch (err) {
        console.error('Failed to fetch agent stats', { requestData, err });
      }

      const result: AgentStatisticDto = {
        totalPriceMonth:               raw.totalPriceMonth              ?? 0,
        totalInvoicesMonth:            raw.totalInvoicesMonth           ?? 0,
        totalPriceToday:               raw.totalPriceToday              ?? 0,
        totalInvoicesToday:            raw.totalInvoicesToday           ?? 0,
        totalPriceChoosedDates:        raw.totalPriceChoosedDates       ?? 0,
        totalInvoicesChoosedDates:     raw.totalInvoicesChoosedDates    ?? 0,
        averageTotalBasketMonth:       raw.averageTotalBasketMonth      ?? 0,
        averageTotalBasketToday:       raw.averageTotalBasketToday      ?? 0,
        averageTotalBasketChoosedDates:raw.averageTotalBasketChoosedDates ?? 0,
        monthlyTotals:                 Array.isArray(raw.monthlyTotals) ? raw.monthlyTotals : [],
      };

      return result;
    }


    async SalesKeeperAlert(userExtId: string): Promise<SalesKeeperAlertDto> {
        const requestData = {
          dbName: this.erpDb,
          userExtId: userExtId,
        };
    
        try {
          const response = await this.PostRequest(requestData, '/api/sales-cycles');
    
          const result: SalesKeeperAlertDto = {
            sumPreviousMonthCurrentYear: response.sumPreviousMonthCurrentYear,
            sumPreviousMonthPreviousYear: response.sumPreviousMonthPreviousYear,
            averageLastThreeMonths: response.averageLastThreeMonths,
          };
    
          return result;
        } catch (error) {
          const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
          throw new Error(message);
        }
    }

    async SalesQuantityKeeperAlert(userExtId: string): Promise<SalesQuantityKeeperAlertLineDto[]> {
        const requestData = {
          dbName: this.erpDb,
          userExtId: userExtId,
        };
    
        try {
          const response = await this.PostRequest(requestData, '/api/items-sales-cycles');
    
          const alertLines: SalesQuantityKeeperAlertLineDto[] = [];
    
          response.items.forEach((item: any) => {
            const alertLine: SalesQuantityKeeperAlertLineDto = {
              sku: item.ItemKey,
              productDescription: item.ItemName,
              sumPreviousMonthCurrentYear: item.sumPreviousMonthCurrentYear,
              sumPreviousMonthPreviousYear: item.sumPreviousMonthPreviousYear,
              averageLastThreeMonths: item.averageLastThreeMonths,
            };
            alertLines.push(alertLine);
          });
    
          return alertLines;
        } catch (error) {
          const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
          throw new Error(message);
        }
    }

    async GetPriceOnline(userExtId: string, sku: string | string[], priceListNumber: string | string[]): Promise<PriceDto[]> {
        const requestData = {
          dbName: this.erpDb,
          skuList: Array.isArray(sku) ? sku : [sku],
          externalUserId: userExtId,
          priceListNumber: Array.isArray(priceListNumber) ? priceListNumber : [priceListNumber] 
        };
        try {
          const response = await this.PostRequest(requestData, '/api/online-prices');
          const prices: PriceDto[] = [];
    
          response.prices.forEach((price: any) => {
            const priceDto: PriceDto = {
              sku: price.ItemKey,
              group: null,
              basePrice: price.originalPrice,
              price: price.price,
              discount: price.DiscountPrc,
              priceAfterDiscount: price.PriceAfterDiscount,
              vatPrice: price.VatPrice,
              vatAfterDiscount: price.VatAfterDiscount,
            };
            prices.push(priceDto);
          });
    
          return prices;
        } catch (error) {
          const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
          throw new Error(message);
        }
    }

    async GetStockOnline(sku: string | string[], warehouse?: string): Promise<StockDto[]> {
        const requestData = {
          dbName: this.erpDb,
          skus: Array.isArray(sku) ? sku : [sku], 
          warehouse: warehouse || null, 
        };
        try {
          const response = await this.PostRequest(requestData, '/api/stocks');
    
          const stocks: StockDto[] = [];
    
          response.items.forEach((stock: any) => {
            const stockDto: StockDto = {
              sku: stock.ITEMKEY,
              stock: stock.ITEMWARHBAL,
              warehouse: stock.Warehouse || warehouse || null, 
            };
            stocks.push(stockDto);
          });
    
          return stocks;
        } catch (error) {
          const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
          throw new Error(message);
        }
    }

    async ProductsImBuy(userExtId: string): Promise<string[]> {
        // Implement the logic here
        return []
    }

    async ProductsImNotBuy(userExtId: string): Promise<string[]> {
        // Implement the logic here
        return []
    }

    async GetUserProfile(userExtId: string): Promise<dynamicTableDto> {
        const requestData = {
          dbName: this.erpDb,
          userExtId: userExtId
        };
    
        try {
          const response = await this.PostRequest(requestData, '/api/user-profile');
    
          const result: dynamicTableDto = {
            columns: [
              'קוד מיון',
              'ת.תשלום',
              'סך עסקאות',
              'סל ממוצע',
              'מכירות חודשי',
              'יעד חודשי',
              'ערבות אישית',
              'ביטוח אשראי',
              'יתרת חוב',
              'חוב בסיכון',
              'אובליגו',
              'אובליגו לניצול'
            ],
            columnsEnglish: [
              'Sort Code',
              'Payment Date',
              'Total Transactions',
              'Average Basket',
              'Monthly Sales',
              'Monthly Target',
              'Personal Guarantee',
              'Credit Insurance',
              'Outstanding Balance',
              'At-Risk Debt',
              'Obligo',
              'Available Obligo'
            ],
            lines: [
              response.Users.SortGroup,
              '',
              response.Totals.TotalOrderSum,
              response.Totals.MonthlyAverage,
              response.Totals.TotalOrderSumCurrentMonth,
              response.Totals.MonthlyObjective,
              '',
              '',
              response.Users.Balance,
              response.Users.Balance + response.Cheqs,
              response.Users.MaxObligo,
              response.Users.MaxObligo + response.Users.Balance
            ]
          };
    
          return result;
        } catch (error) {
          const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
          throw new Error(message);
        }
    }

    async GetPurchaseDelivery(sku: string): Promise<PurchaseDeliveryItemDto[]> {
        const requestData = {
          dbName: this.erpDb,
          sku: sku,
        };
    
        try {
          const response = await this.PostRequest(requestData, '/api/purchase-delivery');
          const purchaseDeliveryItems: PurchaseDeliveryItemDto[] = [];
          response.items.forEach((itemRec: any) => {
            const purchaseDeliveryItem: PurchaseDeliveryItemDto = {
              sku: itemRec.ItemKey,
              docNumber: itemRec.DocNumber,
              quantity: itemRec.Quantity,
              ShipDate: new Date(itemRec.DueDate).toISOString().split('T')[0], 
              warehouse: itemRec.Warehouse,
              status: itemRec.Status,
              address: null, 
              actualDeliveryDate: itemRec.ActualDeliveryDate ? itemRec.ActualDeliveryDate : null,
            };
    
            purchaseDeliveryItems.push(purchaseDeliveryItem);
          });
    
          return purchaseDeliveryItems;
        } catch (error) {
          const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
          throw new Error(message);
        }
    }

    async GetWarehouseDetailedBySku(sku: string, warehouses?: string[]): Promise<WarehousesItemDetailedDto[]> {
        const requestData = {
            dbName: this.erpDb,
            sku: sku,
            warehouses: warehouses
        };
        console.log('requestData',requestData)
        try {
            const response = await this.PostRequest(requestData, '/api/purchases');
            const warehouseDetails: WarehousesItemDetailedDto[] = [];
        
            response.items.forEach((warehouse: any) => {
                const warehouseDto: WarehousesItemDetailedDto = {
                warehouseCode: warehouse.WareHouse,
                warehouseTilte: null , 
                city: null,
                address: null, 
                stock: warehouse.stock,
                committed: warehouse.committed,
                ordered: warehouse.ordered,
                };
                warehouseDetails.push(warehouseDto);
            });
        
            return warehouseDetails;
        } catch (error) {
        const message = error.response
            ? `HTTP error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            : `Error: ${error.message}`;
            throw new Error(message);
        }
    }

    async GetProductPackages(): Promise<ProductPackage[]> {
      //this fetched with GetProducts
      return []
    }
}
