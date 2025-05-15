import { PartialType } from '@nestjs/mapped-types';
import { CreateVarietyDto } from './create-variety.dto';

export class UpdateVarietyDto extends PartialType(CreateVarietyDto) {}
