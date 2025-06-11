import { IsNotEmpty, IsString, Matches, IsBoolean, IsOptional } from 'class-validator';

const CRON_REGEX =
  /^(\*|\d+|\d+\-\d+)(\/\d+)? (\*|\d+|\d+\-\d+)(\/\d+)? (\*|\d+|\d+\-\d+)(\/\d+)? (\*|\d+|\d+\-\d+)(\/\d+)? (\*|\d+|\d+\-\d+)(\/\d+)? (\*|\d+|\d+\-\d+)(\/\d+)?$/;

export class CreateCronDto {
  @IsString()
  @IsNotEmpty()
  jobName: string;

  @IsString()
  @Matches(CRON_REGEX, {
    message: 'cronTime must be a valid 6-field cron expression (sec min hr dom mon dow)',
  })
  cronTime: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
