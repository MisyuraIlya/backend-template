import { PartialType } from '@nestjs/mapped-types';
import { CreateMediaObjectDto } from './create-media-object.dto';

export class UpdateMediaObjectDto extends PartialType(CreateMediaObjectDto) {}
