export interface PurchaseDeliveryItemDto {
  sku?: string | null;
  docNumber?: string | null;
  quantity?: number | null;
  ShipDate?: string | null;
  warehouse?: string | null;
  status?: string | null;
  address?: string | null;
  actualDeliveryDate?: string | null;
}