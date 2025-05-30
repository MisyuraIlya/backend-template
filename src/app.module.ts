import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { UserModule } from './modules/user/user.module';
import { PriceListModule } from './modules/price-list/price-list.module';
import { PriceListDetailedModule } from './modules/price-list-detailed/price-list-detailed.module';
import { PriceListUserModule } from './modules/price-list-user/price-list-user.module';
import { AgentObjectiveModule } from './modules/agent-objective/agent-objective.module';
import { AgentTargetModule } from './modules/agent-target/agent-target.module';
import { AttributeMainModule } from './modules/attribute-main/attribute-main.module';
import { AttributeSubModule } from './modules/attribute-sub/attribute-sub.module';
import { BonusModule } from './modules/bonus/bonus.module';
import { BonusDetailedModule } from './modules/bonus-detailed/bonus-detailed.module';
import { HistoryModule } from './modules/history/history.module';
import { HistoryDetailedModule } from './modules/history-detailed/history-detailed.module';
import { HomeEditModule } from './modules/home-edit/home-edit.module';
import { HomeMediaModule } from './modules/home-media/home-media.module';
import { MediaObjectModule } from './modules/media-object/media-object.module';
import { VarietyModule } from './modules/variety/variety.module';
import { NotificationModule } from './modules/notification/notification.module';
import { NotificationUserModule } from './modules/notification-user/notification-user.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ProductAttributeModule } from './modules/product-attribute/product-attribute.module';
import { ProductImagesModule } from './modules/product-images/product-images.module';
import { User } from './modules/user/entities/user.entity';
import { Product } from './modules/product/entities/product.entity';
import { Category } from './modules/category/entities/category.entity';
import { PriceList } from './modules/price-list/entities/price-list.entity';
import { PriceListDetailed } from './modules/price-list-detailed/entities/price-list-detailed.entity';
import { PriceListUser } from './modules/price-list-user/entities/price-list-user.entity';
import { AttributeMain } from './modules/attribute-main/entities/attribute-main.entity';
import { AttributeSub } from './modules/attribute-sub/entities/attribute-sub.entity';
import { History } from './modules/history/entities/history.entity';
import { HistoryDetailed } from './modules/history-detailed/entities/history-detailed.entity';
import { ProductAttribute } from './modules/product-attribute/entities/product-attribute.entity';
import { MediaObject } from './modules/media-object/entities/media-object.entity';
import { ProductImages } from './modules/product-images/entities/product-image.entity';
import { Bonus } from './modules/bonus/entities/bonus.entity';
import { BonusDetailed } from './modules/bonus-detailed/entities/bonus-detailed.entity';
import { HomeEdit } from './modules/home-edit/entities/home-edit.entity';
import { HomeMedia } from './modules/home-media/entities/home-media.entity';
import { Notification } from './modules/notification/entities/notification.entity';
import { Payment } from './modules/payment/entities/payment.entity';
import { Variety } from './modules/variety/entities/variety.entity';
import { AgentObjective } from './modules/agent-objective/entities/agent-objective.entity';
import { AgentTarget } from './modules/agent-target/entities/agent-target.entity';
import { NotificationUser } from './modules/notification-user/entities/notification-user.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ErpManager } from './erp/erp.manager';
import { AdminModule } from './modules/admin/admin.module';
import { CronModule } from './cron/cron.module';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentModule } from './modules/document/document.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggerModule } from './common/logger/logger.module';
import { LoggingInterceptor } from './common/logger/logging.interceptor';
import { SupportModule } from './modules/support/support.module';
import { OfflineModule } from './modules/offline/offline.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PushSubscriptionModule } from './modules/push-subscription/push-subscription.module';
import { PushSubscription } from './modules/push-subscription/entities/push-subscription.entity';
import { ProductPackage } from './modules/product-package/entities/product.entity';
import { ProductPackageModule } from './modules/product-package/product-package.module';

@Module({
  imports: [

    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,    
        limit: 1000,   
      },
    ]),

    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT!, 10) || 3306,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        namingStrategy: new SnakeNamingStrategy(),
        entities: [
          User,
          Category,
          Product,
          PriceList,
          PriceListDetailed,
          PriceListUser,
          AttributeMain,
          AttributeSub,
          ProductAttribute,
          History,
          HistoryDetailed,
          MediaObject,
          ProductImages,
          Bonus,
          BonusDetailed,
          HomeEdit,
          HomeMedia,
          Notification,
          NotificationUser,
          Payment,
          Variety,
          AgentObjective,
          AgentTarget,
          PushSubscription,
          ProductPackage
        ],
        synchronize: true,
      }),
    }),

    PrometheusModule.register(),
    TypeOrmModule.forFeature([User]),
    ScheduleModule.forRoot(),
    ProductModule,
    CategoryModule,
    UserModule,
    PriceListModule,
    PriceListDetailedModule,
    PriceListUserModule,
    AgentObjectiveModule,
    AgentTargetModule,
    AttributeMainModule,
    AttributeSubModule,
    BonusModule,
    BonusDetailedModule,
    HistoryModule,
    HistoryDetailedModule,
    HomeEditModule,
    HomeMediaModule,
    MediaObjectModule,
    VarietyModule,
    NotificationModule,
    NotificationUserModule,
    PaymentModule,
    ProductAttributeModule,
    ProductImagesModule,
    AdminModule,
    CronModule,
    AuthModule,
    DocumentModule,
    LoggerModule,
    SupportModule,
    OfflineModule,
    PushSubscriptionModule,
    ProductPackageModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ErpManager,
    LoggingInterceptor,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
