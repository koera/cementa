export interface AccountChip {
    id: number | null;
    name: string;
}

export interface AccountBalance {
  id: number;
  name: string;
  balance: number;          // cents: opening balance + income - expenses
  type?: 'bank' | 'cash';
  openingBalance?: number;  // cents
  txnCount?: number;        // placeholder, later counted from SQLite
}

export interface NewAccount {
  id?: number;              // present only when editing
  name: string;
  type: 'bank' | 'cash';
  openingCents: number;
}