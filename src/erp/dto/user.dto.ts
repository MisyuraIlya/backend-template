export interface UserDto {
  userExId: string;
  name?: string;
  phone?: string;
  isBlocked?: boolean;
  userDescription?: string;
  address?: string;
  town?: string;
  payCode?: string;
  globalDiscount?: number;
  payDes?: string;
  maxCredit?: number;
  maxObligo?: number;
  hp?: string;
  taxCode?: string;
  agentCode?: string;
  isVatEnabled?: boolean;
  subUsers: UserDto[];
  salesCurrency?: string;
}