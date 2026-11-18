import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TxnView } from '../../models/transaction.model';
import { IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-transaction-item',
  templateUrl: './transaction-item.component.html',
  styleUrls: ['./transaction-item.component.scss'],
  imports: [CurrencyPipe, IonItemSliding, IonItem, IonItemOptions, IonItemOption, IonIcon],
})
export class TransactionItemComponent {
  @Input({ required: true }) txn!: TxnView;
  @Output() txnDelete = new EventEmitter<TxnView>();
  @Output() txnSelect = new EventEmitter<TxnView>();

  constructor() {
    addIcons({ trashOutline });
  }

  onDelete(slider: IonItemSliding) {
    slider.close(); // slide the row back
    this.txnDelete.emit(this.txn);
  }

  onOpen() {
    console.log('[item] tapped', this.txn.id);
    this.txnSelect.emit(this.txn);
  }
}
