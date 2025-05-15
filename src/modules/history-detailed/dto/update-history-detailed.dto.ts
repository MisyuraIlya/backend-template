import { PartialType } from '@nestjs/mapped-types';
import { CreateHistoryDetailedDto } from './create-history-detailed.dto';

export class UpdateHistoryDetailedDto extends PartialType(CreateHistoryDetailedDto) {}
