export interface TxnView {
  id: number;
  type: 'income' | 'expense';
  amount: number;        // in cents, always positive
  date: string;          // 'YYYY-MM-DD'
  note: string;
  categoryName: string;  // for income, use 'Income'
  accountName: string;
  details: string;
}

export interface NewTxn {
  type: 'income' | 'expense';
  amountCents: number;
  date: string;               // 'YYYY-MM-DD'
  accountId: number;
  categoryId: number | null;  // always null for income
  note: string;
  details: string;
}

export interface TxnFilter {
  accountId: number | null;
  month: string | null;
  categoryId: number | null;
  search: string;
}