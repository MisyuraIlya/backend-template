import { BonusDto } from "../dto/bonusItem.dto";
import { CategoryDto } from "../dto/category.dto";
import { PriceListDto } from "../dto/priceList.dto";
import { PriceListDetailedDto } from "../dto/priceListDetailed.dto";
import { PriceListUserDto } from "../dto/priceListUser.dto";
import { ProductDto } from "../dto/product.dto";
import { StockDto } from "../dto/stock.do";
import { UserDto } from "../dto/user.dto";

export interface CronInterface {
    GetCategories(): Promise<CategoryDto[]>;
    GetProducts(pageSize?: number, skip?: number): Promise<ProductDto[]>;
    GetUsers(): Promise<UserDto[]>;
    GetVariety(): Promise<string[]>;
    GetPriceList(): Promise<PriceListDto[]>;
    GetPriceListUser(): Promise<PriceListUserDto[]>;
    GetPriceListDetailed(): Promise<PriceListDetailedDto[]>;
    GetStocks(): Promise<StockDto[]>;
    GetBonuses(): Promise<BonusDto[]>;
    GetAgents(): Promise<UserDto[]>;
}