export interface BonusDto {
  sku?: string | null;
  minimumQuantity: number; 
  bonusSku?: string | null;
  bonusQuantity: number;  

  userExtId?: string | null;
  extId?: string | null;
  title?: string | null;
  fromDate?: string | null;
  expiredAt?: string | null;
}