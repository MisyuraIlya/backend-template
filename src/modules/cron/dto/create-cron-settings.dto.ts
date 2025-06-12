import { IsString, IsBoolean } from 'class-validator';

export class CreateCronSettingsDto {
  @IsString()
  cronTime: string;

  @IsBoolean()
  isActive: boolean;
}
