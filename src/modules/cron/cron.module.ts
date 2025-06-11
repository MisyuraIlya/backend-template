import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { Product } from '../product/entities/product.entity';
import { PriceList } from '../price-list/entities/price-list.entity';
import { PriceListDetailed } from '../price-list-detailed/entities/price-list-detailed.entity';
import { PriceListUser } from '../price-list-user/entities/price-list-user.entity';
import { AttributeMain } from '../attribute-main/entities/attribute-main.entity';
import { AttributeSub } from '../attribute-sub/entities/attribute-sub.entity';
import { ProductAttribute } from '../product-attribute/entities/product-attribute.entity';
import { HomeEdit } from '../home-edit/entities/home-edit.entity';
import { Variety } from '../variety/entities/variety.entity';
import { ProductPackage } from '../product-package/entities/product.entity';
import { GetAgentService } from './fetchers/GetAgents';
import { Cron } from './entities/cron.entity';
import { ErpManager } from 'src/erp/erp.manager';
import { GetAttributeProducts } from './fetchers/GetAttributeProducts';
import { GetAttributesMainService } from './fetchers/GetAttributesMain';
import { GetAttributesSubService } from './fetchers/GetAttributesSub';
import { GetCategoriesService } from './fetchers/GetCategories';
import { GetPriceListsService } from './fetchers/GetPriceList';
import { GetPriceListDetailedService } from './fetchers/GetPriceListDetailed';
import { GetProductPackagesService } from './fetchers/GetProductPackage';
import { GetProductsService } from './fetchers/GetProducts';
import { GetUsersService } from './fetchers/GetUsers';
import { GetVarietiesService } from './fetchers/GetVarieties';
import { GetPriceListUserService } from './fetchers/GetPriceListUser';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Category,
      Product,
      PriceList,
      PriceListDetailed,
      PriceListUser,
      AttributeMain,
      AttributeSub,
      ProductAttribute,
      HomeEdit,
      Variety,
      ProductPackage,
      Cron
    ]),
  ],
  controllers: [CronController],
  providers: [
    CronService,
    GetAgentService,
    GetAttributeProducts,
    GetAttributesMainService,
    GetAttributesSubService,
    GetCategoriesService,
    GetPriceListsService,
    GetPriceListDetailedService,
    GetPriceListUserService,
    GetProductPackagesService,
    GetProductsService,
    GetUsersService,
    GetVarietiesService,
    ErpManager
  ],
})
export class CronModule {}
