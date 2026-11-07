import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
  AlertController,
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { CurrencyPipe } from '@angular/common';
import { TransactionFiltersComponent } from '../../components/transaction-filters/transaction-filters.component';
import { AccountChip } from '../../models/account.model';
import { NewTxn, TxnView } from '../../models/transaction.model';
import { TransactionGroupComponent } from '../../components/transaction-group/transaction-group.component';
import { TransactionFormComponent } from '../../components/transaction-form/transaction-form.component';
import { TransactionService } from '../../services/transaction.service';
import { AccountService } from '../../services/account.service';
import { CategoryService } from '../../services/category.service';
import { Option } from '../../models/option.model';

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
    TransactionFormComponent,
  ],
})
export class TransactionPage implements OnInit {
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);
  private categoryService = inject(CategoryService);
  private alertController = inject(AlertController);

  selectedMonth = 'all';
  selectedAccountId: number | null = null;
  selectedCategory = 'all';

  isFormOpen = signal(false);
  isSaving = signal(false);
  months = signal<Option[]>([]);

  constructor() {
    addIcons({ add });
  }

  readonly accounts = computed<AccountChip[]>(() => [
    { id: null, name: 'All accounts' },
    ...this.accountService.accounts().map((a) => ({ id: a.id, name: a.name })),
  ]);

  readonly categories = computed<Option[]>(() => [
    { value: 'all', label: 'All categories' },
    ...this.categoryService.categories().map((c) => ({ value: String(c.id), label: c.name })),
  ]);

  readonly formAccounts = this.accountService.accounts;

  readonly formCategories = this.categoryService.categories;

  readonly groups = computed(() => {
    const map = new Map<string, TxnView[]>();
    for (const t of this.transactionService.transactions()) {
      map.set(t.date, [...(map.get(t.date) ?? []), t]);
    }
    return [...map.entries()].map(([date, items]) => ({ date, items })); // already newest first
  });

  async ngOnInit() {
    await Promise.all([this.accountService.load(), this.categoryService.load()]);
    this.months.set(await this.transactionService.months());
    await this.reload();
  }

  get balance() {
    return this.accountService.total() / 100;
  }

  get income() {
    return this.transactionService.income() / 100;
  }

  get expenses() {
    return this.transactionService.expenses() / 100;
  }

  onAccountChange(id: number | null) {
    this.selectedAccountId = id;
    this.reload();
  }
  onMonthChange(v: string) {
    this.selectedMonth = v;
    this.reload();
  }
  onCategoryChange(v: string) {
    this.selectedCategory = v;
    this.reload();
  }

  exportPdf() {
    /* generate the PDF from the filtered list, later */
  }

  onSelectTransaction(t: TxnView) {
    /* open the edit form later */
  }
  async onDeleteTransaction(transaction: TxnView) {
    await this.transactionService.remove(transaction.id);
    this.reload();
  }

  async onSaveTransaction(n: NewTxn) {
    const t0 = performance.now();

    if (this.isSaving()) return; // ignore a second tap
    this.isSaving.set(true);
    try {
      await this.transactionService.add(n);

      this.isFormOpen.set(false); // saved, so close the form
    } catch (e) {
      console.error(e);
      const alert = await this.alertController.create({
        header: 'Could not save',
        message: 'The transaction was not saved. Please try again.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    } finally {
      this.isSaving.set(false);
    }

    this.months.set(await this.transactionService.months());
  }

  private reload() {
    return this.transactionService.load({
      accountId: this.selectedAccountId,
      month: this.selectedMonth === 'all' ? null : this.selectedMonth,
      categoryId: this.selectedCategory === 'all' ? null : Number(this.selectedCategory),
    });
  }
}
