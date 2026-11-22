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
  LoadingController,
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
import { ActivatedRoute, Router } from '@angular/router';
import { PdfReportService, ReportFile } from '../../services/pdf-report.service';

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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reportService = inject(PdfReportService);
  private loadingController = inject(LoadingController);

  selectedMonth = 'all';
  selectedAccountId: number | null = null;
  selectedCategory = 'all';
  searchText = '';
  dateFrom = '';
  dateTo = '';

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
    this.route.queryParamMap.subscribe((p) => {
      const id = p.get('accountId');
      this.selectedAccountId = id ? Number(id) : null;
      this.reload();
    });
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
    this.router.navigate([], { queryParams: { accountId: id }, replaceUrl: true });
  }

  onMonthChange(v: string) {
    this.selectedMonth = v;
    this.reload();
  }

  onCategoryChange(v: string) {
    this.selectedCategory = v;
    this.reload();
  }

  async exportPdf() {
    const loading = await this.loadingController.create({ message: 'Preparing PDF…', spinner: 'crescent' });
    await loading.present();

    let file: ReportFile;
    try {
      file = await this.reportService.generate({
        filters: {
          account: this.accounts().find((a) => a.id === this.selectedAccountId)?.name ?? 'All',
          month: this.periodLabel(),
          category: this.labelOf(this.categories(), this.selectedCategory),
          search: this.searchText.trim(),
        },
        transactions: this.transactionService.transactions(),
        categories: this.categoryService.categories(),
        accounts: this.accountService.accounts(),
      });
    } catch (e) {
      console.error(e);
      await this.showError('Could not create the PDF. Please try again.');
      return;
    } finally {
      await loading.dismiss(); // close the loader before the share sheet opens
    }

    try {
      await this.reportService.deliver(file);
    } catch (e: any) {
      // closing the share sheet without sharing is not an error
      if (
        !String(e?.message ?? e)
          .toLowerCase()
          .includes('cancel')
      ) {
        console.error(e);
        await this.showError('Could not open the PDF. Please try again.');
      }
    }
  }

  async onSelectTransaction(transaction: TxnView) {
    this.router.navigate(['/transaction-details', transaction.id]);
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

  onSearchChange(v: string) {
    if (v === this.searchText) return; // clearing can fire two events
    this.searchText = v;
    this.reload();
  }

  onRangeChange(r: { from: string; to: string }) {
    this.dateFrom = r.from;
    this.dateTo = r.to;
    this.reload();
  }

  onClearFilters() {
  this.selectedAccountId = null;
  this.selectedMonth = 'all';      
  this.selectedCategory = 'all';
  this.dateFrom = '';
  this.dateTo = '';
  this.reload();
}

  private reload() {
    const range = this.selectedMonth === 'range';
    return this.transactionService.load({
      accountId: this.selectedAccountId,
      month: range || this.selectedMonth === 'all' ? null : this.selectedMonth,
      dateFrom: range && this.dateFrom ? this.dateFrom : null,
      dateTo: range && this.dateTo ? this.dateTo : null,
      categoryId: this.selectedCategory === 'all' ? null : Number(this.selectedCategory),
      search: this.searchText,
    });
  }

  private labelOf(options: { value: string; label: string }[], value: string): string {
    return options.find((o) => o.value === value)?.label ?? 'All';
  }

  private async showError(message: string) {
    const alert = await this.alertController.create({ header: 'Export failed', message, buttons: ['OK'] });
    await alert.present();
  }

  private periodLabel(): string {
    if (this.selectedMonth !== 'range') return this.labelOf(this.months(), this.selectedMonth);
    const fmt = (iso: string) =>
      new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    if (this.dateFrom && this.dateTo) return `${fmt(this.dateFrom)} – ${fmt(this.dateTo)}`;
    if (this.dateFrom) return `From ${fmt(this.dateFrom)}`;
    if (this.dateTo) return `Until ${fmt(this.dateTo)}`;
    return 'All dates';
  }
}
