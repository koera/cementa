import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { AccountBalance } from '../../models/account.model';

@Component({
  selector: 'app-account-item',
  templateUrl: './account-item.component.html',
  styleUrls: ['./account-item.component.scss'],
  imports: [CurrencyPipe],
})
export class AccountItemComponent {
  @Input({ required: true }) account!: AccountBalance;
  @Input() subtitle = 'Account';
  @Output() accountSelect = new EventEmitter<AccountBalance>();
}