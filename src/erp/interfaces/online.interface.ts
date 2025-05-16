import { AgentStatisticDto } from "../dto/agentStatistic.dto";
import { DocumentItemsDto } from "../dto/documentItems.dto";
import { DocumentsDto } from "../dto/documents.dto";
import { dynamicTableDto } from "../dto/dynamicTable";
import { PriceDto } from "../dto/price.dto";
import { PurchaseDeliveryItemDto } from "../dto/purchaseDelivery.dto";
import { PurchaseHistoryItem } from "../dto/purchaseHistoryItem.dto";
import { SalesKeeperAlertDto } from "../dto/salesKeeperAlert.dto";
import { SalesQuantityKeeperAlertLineDto } from "../dto/salesQuantityKeeperAlert.dto";
import { StockDto } from "../dto/stock.do";
import { UserDto } from "../dto/user.dto";
import { WarehousesItemDetailedDto } from "../dto/warehouse.dto";

export interface OnlineInterface {
    SendOrder(history: any): Promise<string>;

    FindUser({userExtId,phone}: {userExtId: string, phone:string}): Promise<UserDto | null>

    GetDocuments(
      dateFrom: Date, 
      dateTo: Date, 
      documentsType: string, 
      pageSize: number, 
      currentPage: number, 
      userExtId?: string, 
      search?: string
    ): Promise<DocumentsDto>;
  
    GetDocumentsItem(
      documentNumber: string, 
      documentType: string, 
      userExId?: string
    ): Promise<DocumentItemsDto>;
  
    GetCartesset(userExId: string, dateFrom: Date, dateTo: Date): Promise<dynamicTableDto>;
  
    GetDebit(userExId: string, dateFrom: Date, dateTo: Date): Promise<dynamicTableDto>;
  
    PurchaseHistoryByUserAndSku(userExtId: string, sku: string): Promise<PurchaseHistoryItem[]>;
  
    GetAgentStatistic(agentId: string, dateFrom: string, dateTo: string): Promise<AgentStatisticDto>;
  
    SalesKeeperAlert(userExtId: string): Promise<SalesKeeperAlertDto>;
  
    SalesQuantityKeeperAlert(userExtId: string): Promise<SalesQuantityKeeperAlertLineDto[]>;
  
    GetPriceOnline(userExtId: string, sku: string | string[], priceListNumber: string | string[]): Promise<PriceDto[]>;
  
    GetStockOnline(sku: string | string[], warehouse?: string): Promise<StockDto[]>;
  
    ProductsImBuy(userExtId: string): Promise<string[]>;
  
    ProductsImNotBuy(userExtId: string): Promise<string[]>;

    GetUserProfile(userExtId: string): Promise<dynamicTableDto>;

    GetPurchaseDelivery(string: string): Promise<PurchaseDeliveryItemDto[]>;

    GetWarehouseDetailedBySku(sku: string, warehouses?: string[]) :Promise<WarehousesItemDetailedDto[]>

}