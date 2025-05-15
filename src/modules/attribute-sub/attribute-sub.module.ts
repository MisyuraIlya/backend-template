import { Module } from '@nestjs/common';
import { AttributeSubService } from './attribute-sub.service';
import { AttributeSubController } from './attribute-sub.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributeSub } from './entities/attribute-sub.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttributeSub]),
  ],
  controllers: [AttributeSubController],
  providers: [AttributeSubService],
})
export class AttributeSubModule {}
