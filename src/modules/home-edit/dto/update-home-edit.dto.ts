import { PartialType } from '@nestjs/mapped-types';
import { CreateHomeEditDto } from './create-home-edit.dto';

export class UpdateHomeEditDto extends PartialType(CreateHomeEditDto) {}
