import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, IonFab, IonFabButton, IonIcon, IonModal } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { CurrencyPipe } from '@angular/common';
import { TransactionFiltersComponent } from '../../components/transaction-filters/transaction-filters.component';
import { AccountChip } from '../../models/account.model';
import { NewTxn, TxnView } from '../../models/transaction.model';
import { TransactionGroupComponent } from '../../components/transaction-group/transaction-group.component';
import { Category } from '../../models/category.model';
import { TransactionFormComponent } from '../../components/transaction-form/transaction-form.component';

@Component({
  selector: 'app-transaction',
  templateUrl: 'transaction.page.html',
  styleUrls: ['transaction.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    CurrencyPipe,
    TransactionFiltersComponent,
    TransactionGroupComponent,
    IonModal,
    TransactionFormComponent
  ],
})
export class TransactionPage {
  constructor() {
    addIcons({ add });
  }
  isFormOpen = false;

  balance = 18420;
  income = 42000;
  expenses = 23520;

  accounts: AccountChip[] = [
    { id: null, name: 'All accounts' },
    { id: 1, name: 'Bank' },
    { id: 2, name: 'Cash' },
  ];

  selectedAccountId: number | null = null;

  months = [
    { value: '2026-11', label: 'Nov 2026' },
    { value: '2026-10', label: 'Oct 2026' },
  ];
  categories = [
    { value: 'all', label: 'All categories' },
    { value: '1', label: 'Materials' },
    { value: '2', label: 'Labor' },
  ];
  selectedMonth = '2026-11';
  selectedCategory = 'all';

  transactions: TxnView[] = [
    {
      id: 1,
      type: 'expense',
      amount: 125000,
      date: '2026-11-06',
      note: 'Concrete delivery',
      categoryName: 'Materials',
      accountName: 'Bank',
    },
    {
      id: 2,
      type: 'expense',
      amount: 64000,
      date: '2026-11-06',
      note: 'Electrician, 2 days',
      categoryName: 'Labor',
      accountName: 'Cash',
    },
    {
      id: 3,
      type: 'income',
      amount: 800000,
      date: '2026-11-06',
      note: 'Client payment 3',
      categoryName: 'Income',
      accountName: 'Bank',
    },
    {
      id: 4,
      type: 'expense',
      amount: 32000,
      date: '2026-11-05',
      note: 'Building permit fee',
      categoryName: 'Permits',
      accountName: 'Bank',
    },
    {
      id: 5,
      type: 'expense',
      amount: 9500,
      date: '2026-11-05',
      note: 'Tool rental',
      categoryName: 'Equipment',
      accountName: 'Cash',
    },
  ];

  onAccountChange(id: number | null) {
    this.selectedAccountId = id; /* reload list */
  }

  exportPdf() {
    /* generate the PDF from the filtered list, later */
  }

  onMonthChange(v: string) {
    this.selectedMonth = v; /* reload list */
  }

  onCategoryChange(v: string) {
    this.selectedCategory = v; /* reload list */
  }

  get groups(): { date: string; items: TxnView[] }[] {
    const map = new Map<string, TxnView[]>();
    for (const t of this.transactions) {
      map.set(t.date, [...(map.get(t.date) ?? []), t]);
    }
    return [...map.entries()]
      .sort(([a], [b]) => b.localeCompare(a)) // newest date first
      .map(([date, items]) => ({ date, items }));
  }

  onSelectTransaction(t: TxnView) {
    /* open the edit form later */
  }

  formAccounts: AccountChip[] = [
    { id: 1, name: 'Bank' },
    { id: 2, name: 'Cash' },
  ];
  formCategories: Category[] = [
    { id: 1, name: 'Materials' },
    { id: 2, name: 'Labor' },
    { id: 3, name: 'Permits' },
    { id: 4, name: 'Equipment' },
  ];

  onSaveTransaction(n: NewTxn) {
    const account = this.formAccounts.find((a) => a.id === n.accountId);
    const category = this.formCategories.find((c) => c.id === n.categoryId);
    this.transactions = [
      {
        id: Date.now(), // temporary, SQLite will give the real id
        type: n.type,
        amount: n.amountCents,
        date: n.date,
        note: n.note || category?.name || 'Income',
        categoryName: category?.name ?? 'Income',
        accountName: account?.name ?? '',
      },
      ...this.transactions,
    ];
    this.isFormOpen = false;
  }
}
