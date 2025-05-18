export interface PriceDto {
  sku: string | null;
  group: string | null;
  basePrice: number | null;
  price: number | null;
  discount: number | null;
  priceAfterDiscount: number | null;
  vatPrice: number | null;
  vatAfterDiscount: number | null;
}