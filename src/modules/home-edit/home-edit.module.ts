import { Module } from '@nestjs/common';
import { HomeEditService } from './home-edit.service';
import { HomeEditController } from './home-edit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeEdit } from './entities/home-edit.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([HomeEdit]),
    CacheModule.register({
      ttl: 30,   
      max: 100,  
    }),
  ],
  controllers: [HomeEditController],
  providers: [HomeEditService],
})
export class HomeEditModule {}
