import { PartialType } from '@nestjs/mapped-types';
import { CreateAttributeSubDto } from './create-attribute-sub.dto';

export class UpdateAttributeSubDto extends PartialType(CreateAttributeSubDto) {}
