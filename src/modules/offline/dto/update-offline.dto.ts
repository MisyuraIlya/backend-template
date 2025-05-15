import { PartialType } from '@nestjs/mapped-types';
import { CreateOfflineDto } from './create-offline.dto';

export class UpdateOfflineDto extends PartialType(CreateOfflineDto) {}
