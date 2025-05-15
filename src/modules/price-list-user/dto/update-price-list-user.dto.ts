import { PartialType } from '@nestjs/mapped-types';
import { CreatePriceListUserDto } from './create-price-list-user.dto';

export class UpdatePriceListUserDto extends PartialType(CreatePriceListUserDto) {}
