import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ErpManager } from 'src/erp/erp.manager';

import { User } from 'src/modules/user/entities/user.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { PriceList } from 'src/modules/price-list/entities/price-list.entity';
import { PriceListDetailed } from 'src/modules/price-list-detailed/entities/price-list-detailed.entity';
import { PriceListUser } from 'src/modules/price-list-user/entities/price-list-user.entity';
import { AttributeMain } from 'src/modules/attribute-main/entities/attribute-main.entity';
import { AttributeSub } from 'src/modules/attribute-sub/entities/attribute-sub.entity';

import { GetUsersService } from './GetUsers';
import { GetAgentService } from './GetAgents';
import { GetCategoriesService } from './GetCategories';
import { GetProductsService } from './GetProducts';
import { GetPriceListsService } from './GetPriceList';
import { GetPriceListDetailedService } from './GetPriceListDetailed';
import { GetPriceListUserService } from './GetPriceListUser';
import { GetAttributesMainService } from './GetAttributesMain';
import { GetAttributesSubService } from './GetAttributesSub';
import { GetAttributeProducts } from './GetAttributeProducts';
import { ProductAttribute } from 'src/modules/product-attribute/entities/product-attribute.entity';
import { InitializationService } from './Initialization';
import { HomeEdit } from 'src/modules/home-edit/entities/home-edit.entity';

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
    ]),
  ],
  providers: [
    ErpManager,
    GetAgentService,
    GetAttributesMainService,
    GetAttributesSubService,
    GetCategoriesService,
    GetPriceListsService,
    GetPriceListDetailedService,
    GetPriceListUserService,
    GetProductsService,
    GetUsersService,
    GetAttributeProducts,
    InitializationService
  ],
  exports: [
    GetAgentService,
    GetAttributesMainService,
    GetAttributesSubService,
    GetCategoriesService,
    GetPriceListsService,
    GetPriceListDetailedService,
    GetPriceListUserService,
    GetProductsService,
    GetUsersService,
    GetAttributeProducts,
    InitializationService
  ],
})
export class CronModule {}
