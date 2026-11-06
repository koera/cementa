import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AccountItemComponent } from '../account-item/account-item.component';
import { AccountBalance } from '../../models/account.model';

@Component({
  selector: 'app-account-group',
  templateUrl: './account-group.component.html',
  styleUrls: ['./account-group.component.scss'],
  imports: [AccountItemComponent],
})
export class AccountGroupComponent {
  @Input() title = 'Accounts';
  @Input({ required: true }) accounts: AccountBalance[] = [];
  @Output() accountSelect = new EventEmitter<AccountBalance>();
  @Output() manage = new EventEmitter<void>();
}