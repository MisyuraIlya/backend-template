export interface AgentStatisticDto {
  monthlyTotals?: any[]; 

  // AVERAGES
  averageTotalBasketChoosedDates?: number | null;
  averageTotalBasketMonth?: number | null;
  averageTotalBasketToday?: number | null;

  // TOTAL
  totalInvoicesChoosedDates?: number | null;
  totalInvoicesMonth?: number | null;
  totalInvoicesToday?: number | null;

  // PRICES
  totalPriceChoosedDates?: number | null;
  totalPriceMonth?: number | null;
  totalPriceToday?: number | null;
}