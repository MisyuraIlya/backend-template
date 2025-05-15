import { PartialType } from '@nestjs/mapped-types';
import { CreateSalesKeeperDto } from './create-sales-keeper.dto';

export class UpdateSalesKeeperDto extends PartialType(CreateSalesKeeperDto) {}
