import { Controller, Get } from '@nestjs/common';
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

@Controller('admin')
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
    console.log('Syncing categories');
    await this.getCategories.handleCron();
    console.log('Syncing products');
    await this.getProducts.handleCron();
    console.log('Syncing main attributes');
    await this.getAttributeMain.handleCron();
    console.log('Syncing sub-attributes');
    await this.getAttributeSub.handleCron();
    console.log('Syncing sub-attributes');
    await this.getAttributeSub.handleCron();
    console.log('Syncing price lists');
    await this.getPriceList.handleCron();
    console.log('Syncing detailed price lists');
    await this.getPriceListDetailed.handleCron();
    console.log('Syncing user price lists');
    await this.getPriceListUser.handleCron();
    return { status: 'ok', message: 'Agent sync complete' };
  }


  @Get('Initialization')
  async triggerInitialization() {
    console.log('Initialization');
    await this.initialization.handleCron();
    return { status: 'ok', message: 'Initialization complete' };
  }


  @Get('sync-users')
  async triggerUserSync() {
    console.log('Syncing usersss');
    await this.getUsers.handleCron();
    return { status: 'ok', message: 'User sync complete' };
  }


  @Get('sync-agent')
  async triggerAgentSync() {
    console.log('Syncing agents');
    await this.getAgents.handleCron();
    return { status: 'ok', message: 'Agent sync complete' };
  }

  @Get('sync-category')
  async triggerCategorySync() {
    console.log('Syncing categories');
    await this.getCategories.handleCron();
    return { status: 'ok', message: 'Category sync complete' };
  }

  @Get('sync-products')
  async triggerProductSync() {
    console.log('Syncing products');
    await this.getProducts.handleCron();
    return { status: 'ok', message: 'Product sync complete' };
  }

  @Get('sync-price-lists')
  async triggerPriceListSync() {
    console.log('Syncing price lists');
    await this.getPriceList.handleCron();
    return { status: 'ok', message: 'Price lists sync complete' };
  }

  @Get('sync-price-list-detailed')
  async triggerPriceListDetailedSync() {
    console.log('Syncing detailed price lists');
    await this.getPriceListDetailed.handleCron();
    return { status: 'ok', message: 'Detailed price list sync complete' };
  }

  @Get('sync-price-list-user')
  async triggerPriceListUserSync() {
    console.log('Syncing user price lists');
    await this.getPriceListUser.handleCron();
    return { status: 'ok', message: 'User price list sync complete' };
  }

  @Get('sync-attributes-main')
  async triggerAttributesMainSync() {
    console.log('Syncing main attributes');
    await this.getAttributeMain.handleCron();
    return { status: 'ok', message: 'Main attributes sync complete' };
  }

  @Get('sync-attributes-sub')
  async triggerAttributesSubSync() {
    console.log('Syncing sub-attributes');
    await this.getAttributeSub.handleCron();
    return { status: 'ok', message: 'Sub-attributes sync complete' };
  }

  @Get('sync-attributes-product')
  async triggerProductAttributesSubSync() {
    console.log('Syncing sub-attributes');
    await this.getAttributeProducts.handleCron();
    return { status: 'ok', message: 'Sub-attributes sync complete' };
  }
}
