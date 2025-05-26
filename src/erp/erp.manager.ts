import { Injectable } from "@nestjs/common";
import { AgentStatisticDto } from "./dto/agentStatistic.dto";
import { BonusDto } from "./dto/bonusItem.dto";
import { CategoryDto } from "./dto/category.dto";
import { DocumentItemsDto } from "./dto/documentItems.dto";
import { DocumentsDto } from "./dto/documents.dto";
import { dynamicTableDto } from "./dto/dynamicTable";
import { PriceDto } from "./dto/price.dto";
import { PriceListDto } from "./dto/priceList.dto";
import { PriceListDetailedDto } from "./dto/priceListDetailed.dto";
import { PriceListUserDto } from "./dto/priceListUser.dto";
import { ProductDto } from "./dto/product.dto";
import { PurchaseDeliveryItemDto } from "./dto/purchaseDelivery.dto";
import { PurchaseHistoryItem } from "./dto/purchaseHistoryItem.dto";
import { SalesKeeperAlertDto } from "./dto/salesKeeperAlert.dto";
import { SalesQuantityKeeperAlertLineDto } from "./dto/salesQuantityKeeperAlert.dto";
import { StockDto } from "./dto/stock.do";
import { UserDto } from "./dto/user.dto";
import { WarehousesItemDetailedDto } from "./dto/warehouse.dto";
import { Hasavshevet } from "./hasavshevet/hasavshevet";
import { CoreInterface } from "./interfaces/core.interface";
import { CronInterface } from "./interfaces/cron.interface";
import { OnlineInterface } from "./interfaces/online.interface";
import { Priority } from "./priority/priority";
import { Sap } from "./sap/sap";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ErpManager implements CoreInterface, CronInterface, OnlineInterface {
    private erp: Priority | Sap | Hasavshevet;

    constructor(
        private configService: ConfigService
    ) {
        const erpType = this.configService.get<string>('ERP_TYPE')!;
        const username = this.configService.get<string>('ERP_USERNAME')!
        const password = this.configService.get<string>('ERP_PASSWORD')!
        const erpDb = this.configService.get<string>('ERP_DB')!
        const url = this.configService.get<string>('ERP_URL')!

        if(erpType  === 'PRIORITY'){
            this.erp = new Priority({username,password,erpDb,url})
        } else if(erpType === 'SAP') {
            this.erp = new Sap({username,password,erpDb,url})
        } else if(erpType ==='HASAVSHEVET') {
            this.erp = new Hasavshevet({username,password,erpDb,url})
        }
    } 

    public async GetRequest(query: string): Promise<any> {
        return this.erp.GetRequest(query);
    }

    public async PostRequest(object: any, table: string): Promise<any> {
        return this.erp.PostRequest(object, table);
    }

    public async PatchRequest(object: any, table: string): Promise<any> {
        return this.erp.PatchRequest(object, table);
    }

    // CronInterface methods
    public async GetCategories(): Promise<CategoryDto[]> {
        return this.erp.GetCategories();
    }

    public async GetProducts(pageSize?: number, skip?: number): Promise<ProductDto[]> {
        return this.erp.GetProducts(pageSize, skip);
    }

    public async GetUsers(): Promise<UserDto[]> {
        return this.erp.GetUsers();
    }

    public async GetVariety(): Promise<string[]> {
        return this.erp.GetVariety();
    }

    public async GetPriceList(): Promise<PriceListDto[]> {
        return this.erp.GetPriceList();
    }

    public async GetPriceListUser(): Promise<PriceListUserDto[]> {
        return this.erp.GetPriceListUser();
    }

    public async GetPriceListDetailed(): Promise<PriceListDetailedDto[]> {
        return this.erp.GetPriceListDetailed();
    }

    public async GetStocks(): Promise<StockDto[]> {
        return this.erp.GetStocks();
    }

    public async GetBonuses(): Promise<BonusDto[]> {
        return this.erp.GetBonuses();
    }

    public async GetAgents(): Promise<UserDto[]> {
        return this.erp.GetAgents();
    }

    public async SendOrder(history: any): Promise<string> {
        return this.erp.SendOrder(history) ?? '';
    }

    public FindUser({ userExtId, phone }: { userExtId: string; phone: string; }): Promise<UserDto | null> {
        return this.erp.FindUser({ userExtId, phone });
    }

    public async GetDocuments(
        dateFrom: Date, 
        dateTo: Date, 
        documentsType: string, 
        pageSize: number, 
        currentPage: number, 
        userExtId?: string | null, 
        search?: string
    ): Promise<DocumentsDto> {
        return this.erp.GetDocuments(dateFrom, dateTo, documentsType, pageSize, currentPage, userExtId, search);
    }

    public async GetDocumentsItem(
        documentNumber: string, 
        documentType: string, 
    ): Promise<DocumentItemsDto> {
        return this.erp.GetDocumentsItem(documentNumber, documentType);
    }

    public async GetCartesset(userExId: string, dateFrom: Date, dateTo: Date): Promise<dynamicTableDto> {
        return this.erp.GetCartesset(userExId, dateFrom, dateTo);
    }

    public async GetDebit(userExId: string, dateFrom: Date, dateTo: Date): Promise<dynamicTableDto> {
        return this.erp.GetDebit(userExId, dateFrom, dateTo);
    }

    public async PurchaseHistoryByUserAndSku(userExtId: string, sku: string): Promise<PurchaseHistoryItem[]> {
        return this.erp.PurchaseHistoryByUserAndSku(userExtId, sku);
    }

    public async GetAgentStatistic(agentId: string, dateFrom: string, dateTo: string): Promise<AgentStatisticDto> {
        return this.erp.GetAgentStatistic(agentId, dateFrom, dateTo);
    }

    public async SalesKeeperAlert(userExtId: string): Promise<SalesKeeperAlertDto> {
        return this.erp.SalesKeeperAlert(userExtId);
    }

    public async SalesQuantityKeeperAlert(userExtId: string): Promise<SalesQuantityKeeperAlertLineDto[]> {
        return this.erp.SalesQuantityKeeperAlert(userExtId);
    }

    public async GetPriceOnline(userExtId: string, sku: string | string[], priceListNumber: string | string[]): Promise<PriceDto[]> {
        return this.erp.GetPriceOnline(userExtId, sku, priceListNumber);
    }

    public async GetStockOnline(sku: string | string[], warehouse?: string): Promise<StockDto[]> {
        return this.erp.GetStockOnline(sku, warehouse);
    }

    public async ProductsImBuy(userExtId: string): Promise<string[]> {
        return this.erp.ProductsImBuy(userExtId);
    }

    public async ProductsImNotBuy(userExtId: string): Promise<string[]> {
        return this.erp.ProductsImNotBuy(userExtId);
    }

    public async GetUserProfile(userExtId: string): Promise<dynamicTableDto> {
        return this.erp.GetUserProfile(userExtId);
    }

    public async GetPurchaseDelivery(string: string): Promise<PurchaseDeliveryItemDto[]> {
        return this.erp.GetPurchaseDelivery(string);
    }

    public async GetWarehouseDetailedBySku(sku: string, warehouses?: string[]): Promise<WarehousesItemDetailedDto[]> {
        return this.erp.GetWarehouseDetailedBySku(sku,warehouses);
    }
}