import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetUsersService } from 'src/cron/GetUsers';
import { GetAgentService } from 'src/cron/GetAgents';
import { GetCategoriesService } from 'src/cron/GetCategories';
import { GetProductsService } from 'src/cron/GetProducts';
import { GetPriceListsService } from 'src/cron/GetPriceList';
import { GetPriceListDetailedService } from 'src/cron/GetPriceListDetailed';
import { GetPriceListUserService } from 'src/cron/GetPriceListUser';
import { GetAttributesMainService } from 'src/cron/GetAttributesMain';
import { GetAttributesSubService } from 'src/cron/GetAttributesSub';
import { GetAttributeProducts } from 'src/cron/GetAttributeProducts';
import { InitializationService } from 'src/cron/Initialization';
import { Admin } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('admin')
// @UseGuards(RolesGuard)
// @Admin()
export class AdminController {
  constructor(
    private readonly initialization: InitializationService,
    private readonly getUsers: GetUsersService,
    private readonly getAgents: GetAgentService,
    private readonly getCategories: GetCategoriesService,
    private readonly getProducts: GetProductsService,
    private readonly getPriceList: GetPriceListsService,
    private readonly getPriceListDetailed: GetPriceListDetailedService,
    private readonly getPriceListUser: GetPriceListUserService,
    private readonly getAttributeMain: GetAttributesMainService,
    private readonly getAttributeSub: GetAttributesSubService,
    private readonly getAttributeProducts: GetAttributeProducts
  ) {}

  @Get('sync-all')
  async triggerAll() {
    console.log('SYNCING');
    console.log('Initialization');
    await this.initialization.handleCron();
    console.log('Syncing users');
    await this.getUsers.handleCron();
    console.log('Syncing agents');
    await this.getAgents.handleCron();
    console.log('Syncing price lists');
    await this.getPriceList.handleCron();
    console.log('Syncing user price lists');
    await this.getPriceListUser.handleCron();
    console.log('Syncing categories');
    await this.getCategories.handleCron();
    console.log('Syncing products');
    await this.getProducts.handleCron();
    console.log('Syncing detailed price lists');
    await this.getPriceListDetailed.handleCron();
    console.log('Syncing main attributes');
    await this.getAttributeMain.handleCron();
    console.log('Syncing sub-attributes');
    await this.getAttributeSub.handleCron();
    console.log('Syncing sub-attributes');
    await this.getAttributeSub.handleCron();

    return { status: 'ok', message: 'Agent sync complete' };
  }


  @Get('Initialization')
  async triggerInitialization() {
    console.log('Initialization');
    await this.initialization.handleCron();
    return { status: 'ok', message: 'Initialization complete' };
  }

  @Get('sync-users')
  triggerUserSync(): { status: boolean; message: string } {
    if (this.getUsers.isSyncing) {
      return { status: false, message: 'User sync already in progress' };
    }
    this.getUsers.handleCron().catch(() => {});
    return { status: true, message: 'User sync started' };
  }

  @Get('status-users')
  getUsersSyncStatus(): { isSyncing: boolean } {
    return { isSyncing: this.getUsers.isSyncing };
  }

  @Get('sync-agent')
  triggerAgentSync(): { status: boolean; message: string } {
    if (this.getAgents.isSyncing) {
      return { status: false, message: 'Agent sync already in progress' };
    }
    this.getAgents.handleCron().catch(() => {});
    return { status: true, message: 'Agent sync started' };
  }

  @Get('status-agent')
  getAgentSyncStatus(): { isSyncing: boolean } {
    return { isSyncing: this.getAgents.isSyncing };
  }

  @Get('sync-category')
  triggerCategorySync(): { status: boolean; message: string } {
    if (this.getCategories.isSyncing) {
      return { status: false, message: 'Category sync already in progress' };
    }
    this.getCategories.handleCron().catch(() => {});
    return { status: true, message: 'Category sync started' };
  }

  @Get('status-category')
  getCategorySyncStatus(): { isSyncing: boolean } {
    return { isSyncing: this.getCategories.isSyncing };
  }

  @Get('sync-products')
  triggerProductSync(): { status: boolean; message: string } {
    if (this.getProducts.isSyncing) {
      return { status: false, message: 'Product sync already in progress' };
    }
    this.getProducts.handleCron().catch(() => {});
    return { status: true, message: 'Product sync started' };
  }

  @Get('status-products')
  getProductSyncStatus(): { isSyncing: boolean } {
    return { isSyncing: this.getProducts.isSyncing };
  }

  @Get('sync-price-lists')
  triggerPriceListSync(): { status: boolean; message: string } {
    if (this.getPriceList.isSyncing) {
      return { status: false, message: 'Price list sync already in progress' };
    }
    this.getPriceList.handleCron().catch(() => {});
    return { status: true, message: 'Price list sync started' };
  }

  @Get('status-price-lists')
  getPriceListSyncStatus(): { isSyncing: boolean } {
    return { isSyncing: this.getPriceList.isSyncing };
  }

  @Get('sync-price-list-detailed')
  triggerPriceListDetailedSync(): { status: boolean; message: string } {
    if (this.getPriceListDetailed.isSyncing) {
      return { status: false, message: 'Detailed price list sync already in progress' };
    }
    this.getPriceListDetailed.handleCron().catch(() => {});
    return { status: true, message: 'Detailed price list sync started' };
  }

  @Get('status-price-list-detailed')
  getPriceListDetailedSyncStatus(): { isSyncing: boolean } {
    return { isSyncing: this.getPriceListDetailed.isSyncing };
  }

  @Get('sync-price-list-user')
  triggerPriceListUserSync(): { status: boolean; message: string } {
    if (this.getPriceListUser.isSyncing) {
      return { status: false, message: 'User price list sync already in progress' };
    }
    this.getPriceListUser.handleCron().catch(() => {});
    return { status: true, message: 'User price list sync started' };
  }

  @Get('status-price-list-user')
  getPriceListUserSyncStatus(): { isSyncing: boolean } {
    return { isSyncing: this.getPriceListUser.isSyncing };
  }

  @Get('sync-attributes-main')
  triggerAttributesMainSync(): { status: boolean; message: string } {
    if (this.getAttributeMain.isSyncing) {
      return { status: false, message: 'Main attributes sync already in progress' };
    }
    this.getAttributeMain.handleCron().catch(() => {});
    return { status: true, message: 'Main attributes sync started' };
  }

  @Get('status-attributes-main')
  getAttributesMainSyncStatus(): { isSyncing: boolean } {
    return { isSyncing: this.getAttributeMain.isSyncing };
  }

  @Get('sync-attributes-sub')
  triggerAttributesSubSync(): { status: boolean; message: string } {
    if (this.getAttributeSub.isSyncing) {
      return { status: false, message: 'Sub-attributes sync already in progress' };
    }
    this.getAttributeSub.handleCron().catch(() => {});
    return { status: true, message: 'Sub-attributes sync started' };
  }

  @Get('status-attributes-sub')
  getAttributesSubSyncStatus(): { isSyncing: boolean } {
    return { isSyncing: this.getAttributeSub.isSyncing };
  }

  @Get('sync-attributes-product')
  triggerProductAttributesSubSync(): { status: boolean; message: string } {
    if (this.getAttributeProducts.isSyncing) {
      return { status: false, message: 'Product attributes sync already in progress' };
    }
    this.getAttributeProducts.handleCron().catch(() => {});
    return { status: true, message: 'Product attributes sync started' };
  }

  @Get('status-attributes-product')
  getProductAttributesSyncStatus(): { isSyncing: boolean } {
    return { isSyncing: this.getAttributeProducts.isSyncing };
  }
}