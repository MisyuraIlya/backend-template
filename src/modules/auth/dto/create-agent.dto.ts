import { CreateUserDto } from './create-user.dto';

export class CreateAgentDto extends CreateUserDto {
  extId: string;
  name: string;
  isAllowOrder: boolean;
  isAllowAllClients: boolean;
}