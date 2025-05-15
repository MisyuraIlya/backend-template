import { PartialType } from '@nestjs/mapped-types';
import { CreateHomeMediaDto } from './create-home-media.dto';

export class UpdateHomeMediaDto extends PartialType(CreateHomeMediaDto) {}
