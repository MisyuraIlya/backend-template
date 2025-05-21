import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateSupportCallDto {
  @IsNotEmpty()           name: string;
  @IsNotEmpty()           phone: string;
  @IsEmail()              email: string;
  @IsNotEmpty()           userExtId: string;
  @IsNotEmpty()           bussnies: string;
  @IsNotEmpty()           message: string;
}
