import { Module } from '@nestjs/common';
import { MediaObjectService } from './media-object.service';
import { MediaObjectController } from './media-object.controller';

@Module({
  controllers: [MediaObjectController],
  providers: [MediaObjectService],
})
export class MediaObjectModule {}
