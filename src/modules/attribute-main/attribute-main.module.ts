import { Module } from '@nestjs/common';
import { AttributeMainService } from './attribute-main.service';
import { AttributeMainController } from './attribute-main.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributeMain } from './entities/attribute-main.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttributeMain]),
  ],
  controllers: [AttributeMainController],
  providers: [AttributeMainService],
})
export class AttributeMainModule {}
