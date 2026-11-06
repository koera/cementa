import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonFooter } from '@ionic/angular';
import { AccountBalance, NewAccount } from '../../models/account.model';

@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.scss'],
  imports: [
    FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonFooter,
  ],
})
export class AccountFormComponent implements OnInit {
  /** Pass an account to edit it; leave empty to create one. */
  @Input() account: AccountBalance | null = null;

  @Output() saved = new EventEmitter<NewAccount>();
  @Output() cancelled = new EventEmitter<void>();

  name = '';
  type: 'bank' | 'cash' = 'bank';
  opening: number | null = null;

  get isEdit(): boolean {
    return this.account !== null;
  }

  ngOnInit() {
    if (this.account) {
      this.name = this.account.name;
      this.type = this.account.type ?? 'bank';
      this.opening = (this.account.openingBalance ?? 0) / 100;
    }
  }

  get canSave(): boolean {
    return this.name.trim().length > 0 && this.opening !== null;
  }

  save() {
    if (!this.canSave) return;
    this.saved.emit({
      id: this.account?.id,
      name: this.name.trim(),
      type: this.type,
      openingCents: Math.round(this.opening! * 100),
    });
  }
}