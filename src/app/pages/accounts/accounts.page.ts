import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { AccountItemComponent } from '../../components/account-item/account-item.component';
import { AccountFormComponent } from '../../components/account-form/account-form.component';
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonList, IonItem, IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonButton, IonModal, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { AccountBalance, NewAccount } from '../../models/account.model';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
  imports: [
    CurrencyPipe, IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent,
    IonList, IonItem, IonItemSliding, IonItemOptions, IonItemOption, IonIcon,
    IonButton, IonModal, AccountItemComponent, AccountFormComponent,
  ],
})
export class AccountsPage {
  private alertCtrl = inject(AlertController);

  readonly maxAccounts = 5;

  accounts: AccountBalance[] = [
    { id: 1, name: 'Bank', type: 'bank', openingBalance: 1000000, balance: 1492000, txnCount: 3 },
    { id: 2, name: 'Cash', type: 'cash', openingBalance: 200000,  balance: 350000,  txnCount: 2 },
  ];

  isFormOpen = false;
  editingAccount: AccountBalance | null = null;

  constructor() {
    addIcons({ trashOutline });
  }

  get total(): number {
    return this.accounts.reduce((sum, a) => sum + a.balance, 0);
  }

  openForm(a: AccountBalance | null) {
    this.editingAccount = a;
    this.isFormOpen = true;
  }

  onSave(n: NewAccount) {
    if (n.id !== undefined) {
      this.accounts = this.accounts.map(a => {
        if (a.id !== n.id) return a;
        // changing the opening balance moves the current balance by the same amount
        const diff = n.openingCents - (a.openingBalance ?? 0);
        return { ...a, name: n.name, type: n.type, openingBalance: n.openingCents, balance: a.balance + diff };
      });
    } else {
      this.accounts = [
        ...this.accounts,
        { id: Date.now(), name: n.name, type: n.type, openingBalance: n.openingCents, balance: n.openingCents, txnCount: 0 },
      ];
    }
    this.isFormOpen = false;
  }

  async onDelete(a: AccountBalance, slider: IonItemSliding) {
    await slider.close();

    if (this.accounts.length <= 1) {
      return this.info('Keep one account', 'You need at least one account to record transactions.');
    }
    if ((a.txnCount ?? 0) > 0) {
      return this.info(`Can't delete “${a.name}”`, 'This account has transactions. Move or delete them first.');
    }

    const confirm = await this.alertCtrl.create({
      header: 'Delete account?',
      message: `“${a.name}” will be removed.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => { this.accounts = this.accounts.filter(x => x.id !== a.id); },
        },
      ],
    });
    await confirm.present();
  }

  private async info(header: string, message: string) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}