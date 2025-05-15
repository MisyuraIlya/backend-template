import { PartialType } from '@nestjs/mapped-types';
import { CreateBonusDetailedDto } from './create-bonus-detailed.dto';

export class UpdateBonusDetailedDto extends PartialType(CreateBonusDetailedDto) {}
