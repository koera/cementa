import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { AccountItemComponent } from '../../components/account-item/account-item.component';
import { AccountFormComponent } from '../../components/account-form/account-form.component';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonButton,
  IonModal,
  AlertController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { AccountBalance, NewAccount } from '../../models/account.model';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
  imports: [
    CurrencyPipe,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonContent,
    IonList,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonIcon,
    IonButton,
    IonModal,
    AccountItemComponent,
    AccountFormComponent,
  ],
})
export class AccountsPage implements OnInit {
  private alertCtrl = inject(AlertController);
  private accountService = inject(AccountService);

  readonly maxAccounts = 5;

  readonly accounts = this.accountService.accounts;

  isFormOpen = false;
  editingAccount: AccountBalance | null = null;

  constructor() {
    addIcons({ trashOutline });
  }

  ngOnInit(): void {
    this.accountService.load();
  }

  get total() {
    return this.accountService.total();
  }

  openForm(a: AccountBalance | null) {
    this.editingAccount = a;
    this.isFormOpen = true;
  }

  async onSave(n: NewAccount) {
    // await this.accountService.save(n);
    // this.isFormOpen = false;
    // onsole.log('save clicked', n);
    try {
      await this.accountService.save(n);
      this.isFormOpen = false;
    } catch (e) {
      console.error(e);
      await this.info('Could not save', String(e));
    }
  }

  async onDelete(a: AccountBalance, slider: IonItemSliding) {
    await slider.close();

    if (this.accounts().length <= 1) {
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
          handler: () => this.accountService.remove(a.id),
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
