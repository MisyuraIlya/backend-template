import { Module } from '@nestjs/common';
import { HomeEditService } from './home-edit.service';
import { HomeEditController } from './home-edit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeEdit } from './entities/home-edit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HomeEdit]),
  ],
  controllers: [HomeEditController],
  providers: [HomeEditService],
})
export class HomeEditModule {}
