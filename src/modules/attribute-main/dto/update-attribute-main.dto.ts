import { PartialType } from '@nestjs/mapped-types';
import { CreateAttributeMainDto } from './create-attribute-main.dto';

export class UpdateAttributeMainDto extends PartialType(CreateAttributeMainDto) {}
