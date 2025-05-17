export interface AgentStatisticDto {
  monthlyTotals: any[]; 

  // AVERAGES
  averageTotalBasketChoosedDates: number;
  averageTotalBasketMonth: number;
  averageTotalBasketToday: number;

  // TOTAL
  totalInvoicesChoosedDates: number;
  totalInvoicesMonth: number;
  totalInvoicesToday: number;

  // PRICES
  totalPriceChoosedDates: number;
  totalPriceMonth: number;
  totalPriceToday: number;
}

export interface AgentStatisticLine {
  agentName:       string;
  agentExtId:      string;
  totalPriceMonth: number;
  total:           number;
  totalOrders:     number;
  averageBasket:   number;
  totalClients:    number;
  monthlyTotals:   MonthlyTotalWithTarget[];
  totalPriceDay:   number;
  totalDayCount:   number;
  totalMonthCount: number;
  totalMissions:   number;
  targetPercent:   number;
}

export interface MonthlyTotalWithTarget {
  monthTitle: string;
  total: number;
  // any other fields coming back from your ERP DTO …
  target: number;
  succeed: boolean | null;
}