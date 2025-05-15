export interface SalesQuantityKeeperAlertLineDto {
  sumPreviousMonthCurrentYear?: number | null;
  sumPreviousMonthPreviousYear?: number | null;
  averageLastThreeMonths?: number | null;
  sku?: string | null;
  productDescription?: string | null;
}
