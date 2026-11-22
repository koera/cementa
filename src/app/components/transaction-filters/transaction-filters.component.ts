import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonIcon, IonSelect, IonSelectOption, IonSearchbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chevronDown, downloadOutline, optionsOutline } from 'ionicons/icons';
import { Option } from '../../models/option.model';

export interface AccountChip {
  id: number | null; // null = "All accounts"
  name: string;
}

@Component({
  selector: 'app-transaction-filters',
  templateUrl: './transaction-filters.component.html',
  styleUrls: ['./transaction-filters.component.scss'],
  imports: [IonIcon, IonSelect, IonSelectOption, IonSearchbar],
})
export class TransactionFiltersComponent {
  open = false;

  @Input() accounts: AccountChip[] = [];
  @Input() selectedAccountId: number | null = null;

  @Input() months: Option[] = [];
  @Input() categories: Option[] = [];
  @Input() selectedMonth = '';
  @Input() selectedCategory = 'all';
  @Input() search = '';
  @Input() dateFrom = '';
  @Input() dateTo = '';

  @Output() accountChange = new EventEmitter<number | null>();
  @Output() exportPdf = new EventEmitter<void>();
  @Output() monthChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() rangeChange = new EventEmitter<{ from: string; to: string }>();
  @Output() clearFilters = new EventEmitter<void>();

  constructor() {
    addIcons({ downloadOutline, optionsOutline });
  }

  onSearch(e: Event) {
    const value = (e as CustomEvent).detail?.value ?? '';
    this.searchChange.emit(String(value));
  }

  get isRange(): boolean {
    return this.selectedMonth === 'range';
  }

  onFrom(v: string) {
    this.rangeChange.emit({ from: v, to: this.dateTo });
  }
  onTo(v: string) {
    this.rangeChange.emit({ from: this.dateFrom, to: v });
  }
  clearRange() {
    this.rangeChange.emit({ from: '', to: '' });
  }

  get activeCount(): number {
    return (
      (this.selectedAccountId !== null ? 1 : 0) +
      (this.selectedMonth !== 'all' ? 1 : 0) +
      (this.selectedCategory !== 'all' ? 1 : 0)
    );
  }

  get summary(): string {
    const parts: string[] = [];
    if (this.selectedAccountId !== null) {
      parts.push(this.accounts.find((a) => a.id === this.selectedAccountId)?.name ?? 'Account');
    }
    if (this.selectedMonth === 'range') {
      if (this.dateFrom || this.dateTo) parts.push(`${this.short(this.dateFrom)} – ${this.short(this.dateTo)}`);
    } else if (this.selectedMonth !== 'all') {
      parts.push(this.months.find((m) => m.value === this.selectedMonth)?.label ?? this.selectedMonth);
    }
    if (this.selectedCategory !== 'all') {
      parts.push(this.categories.find((c) => c.value === this.selectedCategory)?.label ?? 'Category');
    }
    return parts.join(' · ');
  }

  private short(iso: string): string {
    return iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '…';
  }
}
