import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TransactionItemComponent } from '../transaction-item/transaction-item.component';
import { TxnView } from '../../models/transaction.model';

@Component({
  selector: 'app-transaction-group',
  templateUrl: './transaction-group.component.html',
  styleUrls: ['./transaction-group.component.scss'],
  imports: [DatePipe, TransactionItemComponent],
})
export class TransactionGroupComponent {
  @Input({ required: true }) date!: string; // 'YYYY-MM-DD'
  @Input({ required: true }) transactions: TxnView[] = [];
  @Output() select = new EventEmitter<TxnView>();
  @Output() txnDelete = new EventEmitter<TxnView>();
}
