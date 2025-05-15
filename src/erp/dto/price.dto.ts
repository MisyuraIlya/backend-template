export interface PriceDto {
  sku?: string | null;
  basePrice?: string | null;
  price?: number | null;
  discountPrecent?: number | null;
  discountExparationDate?: Date | null; 
  priceAfterDiscount?: number | null;
  vatPrice?: number | null;
  vatAfterDiscount?: number | null;
}