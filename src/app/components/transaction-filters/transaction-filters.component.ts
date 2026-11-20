import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonIcon, IonSelect, IonSelectOption, IonSearchbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chevronDown, downloadOutline } from 'ionicons/icons';
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

  constructor() {
    addIcons({ downloadOutline, chevronDown });
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
}
