import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { AccountChip } from '../transaction-filters/transaction-filters.component';
import { Category } from '../../models/category.model';
import { NewTxn } from '../../models/transaction.model';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonFooter,
    IonSelect,
    IonSelectOption,
    IonSpinner
  ],
})
export class TransactionFormComponent implements OnInit {
  @Input() accounts: AccountChip[] = [];
  @Input() categories: Category[] = [];

  @Output() saved = new EventEmitter<NewTxn>();
  @Output() cancelled = new EventEmitter<void>();

  @Input() saving = false;

  type: 'income' | 'expense' = 'expense';
  amount: number | null = null;
  date = '';
  accountId: number | null = null;
  categoryId: number | null = null;
  note = '';

  ngOnInit() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // local date, not UTC
    this.date = now.toISOString().slice(0, 10);
    this.accountId = this.accounts[0]?.id ?? null;
  }

  setType(t: 'income' | 'expense') {
    this.type = t;
    if (t === 'income') this.categoryId = null;
  }

  get canSave(): boolean {
    return (
      !!this.amount &&
      this.amount > 0 &&
      !!this.date &&
      this.accountId !== null &&
      (this.type === 'income' || this.categoryId !== null)
    );
  }

  save() {
    if (!this.canSave || this.saving) return;
    this.saved.emit({
      type: this.type,
      amountCents: Math.round(this.amount! * 100),
      date: this.date,
      accountId: this.accountId!,
      categoryId: this.type === 'expense' ? this.categoryId : null,
      note: this.note.trim(),
    });
  }
}
