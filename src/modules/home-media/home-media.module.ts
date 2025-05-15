import { Module } from '@nestjs/common';
import { HomeMediaService } from './home-media.service';
import { HomeMediaController } from './home-media.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeMedia } from './entities/home-media.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HomeMedia]),
  ],
  controllers: [HomeMediaController],
  providers: [HomeMediaService],
})
export class HomeMediaModule {}
