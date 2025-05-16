export interface WarehousesItemDetailedDto {
  warehouseCode: string | null;
  warehouseTilte: string | null;
  address: string | null;
  city: string | null;
  stock: number;
  committed: number;
  ordered: number;
}