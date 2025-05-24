import { IsInt } from 'class-validator';

export class ReorderItemDto {
  @IsInt()
  id: number;

  @IsInt()
  orden: number;
}
