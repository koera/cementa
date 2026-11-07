import { Injectable, computed, inject, signal } from '@angular/core';
import { DatabaseService } from './database.service';
import { AccountBalance, NewAccount } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private db = inject(DatabaseService);

  readonly accounts = signal<AccountBalance[]>([]);
  readonly total = computed(() => this.accounts().reduce((s, a) => s + a.balance, 0));

  async load() {
    this.accounts.set(
      await this.db.query<AccountBalance>(`
      SELECT a.id, a.name, a.type,
             a.opening_balance AS openingBalance,
             a.opening_balance + COALESCE(SUM(CASE t.type WHEN 'income' THEN t.amount ELSE -t.amount END), 0) AS balance,
             COUNT(t.id) AS txnCount
      FROM account a
      LEFT JOIN txn t ON t.account_id = a.id
      GROUP BY a.id
      ORDER BY a.id`),
    );
  }

  async save(n: NewAccount) {
    if (n.id !== undefined) {
      await this.db.run('UPDATE account SET name = ?, type = ?, opening_balance = ? WHERE id = ?', [
        n.name,
        n.type,
        n.openingCents,
        n.id,
      ]);
    } else {
      await this.db.run('INSERT INTO account (name, type, opening_balance) VALUES (?, ?, ?)', [
        n.name,
        n.type,
        n.openingCents,
      ]);
    }
    await this.load();
  }

  async remove(id: number) {
    await this.db.run('DELETE FROM account WHERE id = ?', [id]);
    await this.load();
  }
}
