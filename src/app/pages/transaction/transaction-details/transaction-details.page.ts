import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  NavController,
} from '@ionic/angular';
import { TransactionService } from '../../../services/transaction.service';
import { TxnView } from '../../../models/transaction.model';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.page.html',
  styleUrls: ['./transaction-details.page.scss'],
  imports: [CurrencyPipe, DatePipe, IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonButton],
})
export class TransactionDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private nav = inject(NavController);
  private alertCtrl = inject(AlertController);
  private txns = inject(TransactionService);

  constructor() {}

  txn = signal<TxnView | null | undefined>(undefined); // undefined = loading, null = not found

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.txn.set((await this.txns.get(id)) ?? null);
  }

  async onDelete() {
    const t = this.txn();
    if (!t) return;
    const confirm = await this.alertCtrl.create({
      header: 'Delete transaction?',
      message: `“${t.note || t.categoryName}” will be removed.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.txns.remove(t.id);
            this.nav.back();
          },
        },
      ],
    });
    await confirm.present();
  }
}
