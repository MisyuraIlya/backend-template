import { PartialType } from '@nestjs/mapped-types';
import { CreatePriceListDetailedDto } from './create-price-list-detailed.dto';

export class UpdatePriceListDetailedDto extends PartialType(CreatePriceListDetailedDto) {}
