import { Injectable, computed, inject, signal } from '@angular/core';
import { AccountService } from './account.service';
import { CategoryService } from './category.service';
import { DatabaseService } from './database.service';
import { NewTxn, TxnFilter, TxnView } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private db = inject(DatabaseService);
  private accounts = inject(AccountService);
  private categories = inject(CategoryService);

  readonly transactions = signal<TxnView[]>([]);
  readonly income = computed(() => this.sum('income'));
  readonly expenses = computed(() => this.sum('expense'));

  readonly loading = signal(false);

  private filter: TxnFilter = { accountId: null, month: null, categoryId: null, search: '' };

  private static readonly SELECT = `
    SELECT t.id, t.type, t.amount, t.date, t.note, t.details,
          COALESCE(c.name, 'Income') AS categoryName,
          a.name AS accountName
    FROM txn t
    JOIN account a ON a.id = t.account_id
    LEFT JOIN category c ON c.id = t.category_id`;

  private async track<T>(work: () => Promise<T>): Promise<T> {
    const timer = setTimeout(() => this.loading.set(true), 250);
    try {
      return await work();
    } finally {
      clearTimeout(timer);
      this.loading.set(false);
    }
  }

  async load(filter: TxnFilter = this.filter) {
    this.filter = filter;
    await this.track(async () => {
      const where: string[] = [];
      const params: unknown[] = [];
      if (filter.accountId !== null) {
        where.push('t.account_id = ?');
        params.push(filter.accountId);
      }
      if (filter.month) {
        where.push('substr(t.date, 1, 7) = ?');
        params.push(filter.month);
      }
      if (filter.categoryId !== null) {
        where.push('t.category_id = ?');
        params.push(filter.categoryId);
      }
      const q = filter.search.trim();

      if (q) {
        where.push(`(t.note LIKE ? ESCAPE '\\' OR t.details LIKE ? ESCAPE '\\')`);
        const like = `%${q.replace(/[\\%_]/g, (m) => '\\' + m)}%`;
        params.push(like, like);
      }

      this.transactions.set(
        await this.db.query<TxnView>(
          `${TransactionService.SELECT}
          ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
          ORDER BY t.date DESC, t.id DESC`,
          params,
        ),
      );
    });
  }

  /** Months that have transactions, plus the current month, newest first. */
  async months(): Promise<{ value: string; label: string }[]> {
    const rows = await this.db.query<{ m: string }>('SELECT DISTINCT substr(date, 1, 7) AS m FROM txn ORDER BY m DESC');
    const d = new Date();
    const current = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const all = [...new Set([current, ...rows.map((r) => r.m)])].sort().reverse();
    return [
      { value: 'all', label: 'All months' },
      ...all.map((m) => ({
        value: m,
        label: new Date(`${m}-01T12:00:00`).toLocaleDateString('en', { month: 'short', year: 'numeric' }),
      })),
    ];
  }

  async add(n: NewTxn) {
    await this.db.run(
      `INSERT INTO txn (type, amount, date, account_id, category_id, note, details)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [n.type, n.amountCents, n.date, n.accountId, n.categoryId, n.note, n.details],
    );
    await this.refresh();
  }

  async remove(id: number) {
    await this.db.run('DELETE FROM txn WHERE id = ?', [id]);
    await this.refresh();
  }

  async get(id: number): Promise<TxnView | undefined> {
    const rows = await this.db.query<TxnView>(`${TransactionService.SELECT} WHERE t.id = ?`, [id]);
    return rows[0];
  }

  // balances and "spent" depend on the transactions, so reload all three
  private refresh() {
    return Promise.all([this.load(), this.accounts.load(), this.categories.load()]);
  }

  private sum(type: 'income' | 'expense') {
    return this.transactions()
      .filter((t) => t.type === type)
      .reduce((s, t) => s + t.amount, 0);
  }
}
