export interface PurchaseHistoryItem {
  documentNumber?: string;
  date?: string;
  quantity?: number;
  price?: number;
  vatPrice?: number;
  discount?: number;
  totalPrice?: number;
  vatTotal?: number;
}