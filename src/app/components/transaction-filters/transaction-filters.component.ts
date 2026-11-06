import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonIcon, IonSelect, IonSelectOption } from '@ionic/angular';
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
  imports: [IonIcon, IonSelect, IonSelectOption],
})
export class TransactionFiltersComponent {
  @Input() accounts: AccountChip[] = [];
  @Input() selectedAccountId: number | null = null;
  
  @Input() months: Option[] = [];
  @Input() categories: Option[] = [];
  @Input() selectedMonth = '';
  @Input() selectedCategory = 'all';

  @Output() accountChange = new EventEmitter<number | null>();
  @Output() exportPdf = new EventEmitter<void>();
  @Output() monthChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();

  constructor() {
    addIcons({ downloadOutline, chevronDown});
  }
}
