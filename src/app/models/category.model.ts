export interface Category { id: number; name: string; }

export interface CategoryBudget {
  id: number;
  name: string;
  budget: number;  // in cents
  spent: number;   // in cents, calculated from the expenses
  color?: string;
}

export interface NewCategory {
  id?: number;          // present only when editing
  name: string;
  budgetCents: number;
  color: string;
}