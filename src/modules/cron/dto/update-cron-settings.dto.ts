import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateCronSettingsDto {
  @IsOptional()
  @IsString()
  cronTime?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
