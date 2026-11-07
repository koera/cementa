import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

const DB_NAME = 'cementa';

const MIGRATIONS: string[][] = [
  [
    `CREATE TABLE account (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL,
       type TEXT NOT NULL DEFAULT 'bank',
       opening_balance INTEGER NOT NULL DEFAULT 0
     )`,
    `CREATE TABLE category (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL,
       budget_amount INTEGER NOT NULL DEFAULT 0,
       color TEXT NOT NULL DEFAULT '#F59E0B'
     )`,
    `CREATE TABLE txn (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       type TEXT NOT NULL CHECK (type IN ('income','expense')),
       amount INTEGER NOT NULL CHECK (amount > 0),
       date TEXT NOT NULL,
       account_id INTEGER NOT NULL REFERENCES account(id),
       category_id INTEGER REFERENCES category(id),
       note TEXT NOT NULL DEFAULT '',
       created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
     )`,
    `CREATE INDEX idx_txn_date ON txn(date)`,
    `CREATE INDEX idx_txn_category ON txn(category_id)`,
    `CREATE INDEX idx_txn_account ON txn(account_id)`,
    `INSERT INTO account (name, type) VALUES ('Bank', 'bank'), ('Cash', 'cash')`,
  ],
];

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private ready?: Promise<void>;
  private isWeb = Capacitor.getPlatform() === 'web';

  init(): Promise<void> {
    return (this.ready ??= this.open());
  }

  async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    await this.init();
    const res = await this.db.query(sql, params);
    const rows = (res.values ?? []) as Record<string, unknown>[];
    return rows.filter((r) => !('ios_columns' in r)) as T[];
  }

  async run(sql: string, params: unknown[] = []): Promise<number | undefined> {
    await this.init();
    const res = await this.db.run(sql, params);
    if (this.isWeb) await this.sqlite.saveToStore(DB_NAME);
    return res.changes?.lastId;
  }

  private async open() {
    if (this.isWeb) {
      const el = document.createElement('jeep-sqlite');
      document.body.appendChild(el);
      await customElements.whenDefined('jeep-sqlite');
      await this.sqlite.initWebStore();
    }

    const consistent = (await this.sqlite.checkConnectionsConsistency()).result;
    const exists = (await this.sqlite.isConnection(DB_NAME, false)).result;
    this.db =
      consistent && exists
        ? await this.sqlite.retrieveConnection(DB_NAME, false)
        : await this.sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    await this.db.open();

    await this.migrate();
  }

  private async migrate() {
    const res = await this.db.query('PRAGMA user_version');
    let version = Number((res.values ?? []).find((r) => 'user_version' in r)?.user_version ?? 0);
    for (; version < MIGRATIONS.length; version++) {
      await this.db.execute(MIGRATIONS[version].join(';\n') + ';');
      await this.db.execute(`PRAGMA user_version = ${version + 1}`);
    }
    if (this.isWeb) await this.sqlite.saveToStore(DB_NAME);
  }
}
