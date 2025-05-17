import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MediaObjectController } from './media-object.controller';
import { MediaObjectService } from './media-object.service';
import { MediaObject } from './entities/media-object.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MediaObject]),
    MulterModule.register({
      storage: memoryStorage(),  
    }),
  ],
  controllers: [MediaObjectController],
  providers: [MediaObjectService],
})
export class MediaObjectModule {}
