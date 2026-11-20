import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { AccountBalance } from '../models/account.model';
import { CategoryBudget } from '../models/category.model';
import { TxnView } from '../models/transaction.model';

export interface ReportInput {
  filters: { account: string; month: string; category: string; search: string };
  transactions: TxnView[];
  categories: CategoryBudget[];
  accounts: AccountBalance[];
}

export interface ReportFile {
  name: string;
  base64: string;
}

const INK = '#1F2933';
const MUTED = '#5B6670';
const LINE = '#E5DFD3';
const AMBER = '#F59E0B';
const GREEN = '#17694B';
const RED = '#B42318';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' });
const eur = (cents: number) => money.format(Math.abs(cents) / 100);
const signed = (cents: number) => `${cents < 0 ? '−' : '+'}${eur(cents)}`;
const day = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const th = (text: string, right = false) => ({
  text: text.toUpperCase(),
  fontSize: 7,
  color: MUTED,
  alignment: right ? 'right' : 'left',
});
const right = (text: string, extra: object = {}) => ({ text, alignment: 'right', ...extra });

const tableLayout = (hasTotal: boolean) => ({
  hLineWidth: (i: number, node: any) => {
    const last = node.table.body.length;
    if (i === 0 || i === last) return 0;
    if (i === 1) return 1;
    return hasTotal && i === last - 1 ? 1 : 0.5;
  },
  hLineColor: (i: number, node: any) => (i === 1 || (hasTotal && i === node.table.body.length - 1) ? INK : LINE),
  vLineWidth: () => 0,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 4,
  paddingBottom: () => 4,
});

const section = (title: string, note: string) => ({
  text: [
    { text: title.toUpperCase(), bold: true, fontSize: 9 },
    { text: `  · ${note}`, color: MUTED, fontSize: 9 },
  ],
  margin: [0, 14, 0, 4],
});

@Injectable({ providedIn: 'root' })
export class PdfReportService {
  private pdfMake?: Promise<any>;

  /** Builds the PDF and returns it as base64. */
  async generate(input: ReportInput): Promise<ReportFile> {
    const pdfMake = await this.loadPdfMake();
    const base64: string = await pdfMake.createPdf(this.build(input)).getBase64();
    return { name: `cementa-report-${this.today()}.pdf`, base64 };
  }

  /** iPhone/Android: save to the cache and open the share sheet. Browser: download. */
  async deliver(file: ReportFile) {
    if (!Capacitor.isNativePlatform()) {
      const a = document.createElement('a');
      a.href = `data:application/pdf;base64,${file.base64}`;
      a.download = file.name;
      a.click();
      return;
    }
    const saved = await Filesystem.writeFile({
      path: file.name,
      data: file.base64,
      directory: Directory.Cache,
    });
    await Share.share({ title: 'Cementa budget report', url: saved.uri });
  }

  private build(input: ReportInput) {
    const { filters, transactions, categories, accounts } = input;
    const sum = (type: 'income' | 'expense') =>
      transactions.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
    const income = sum('income');
    const expenses = sum('expense');
    const net = income - expenses;

    const summaryCell = (label: string, value: string) => ({
      stack: [
        { text: label.toUpperCase(), fontSize: 7, color: MUTED },
        { text: value, fontSize: 13, bold: true, margin: [0, 2, 0, 0] },
      ],
    });

    // ---- budget by category (whole project)
    const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
    const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
    const remainingText = (left: number) => (left < 0 ? `${eur(-left)} over` : `${eur(left)} left`);
    const categoryRows = categories.map((c) => {
      const left = c.budget - c.spent;
      return [
        c.name,
        right(eur(c.budget)),
        right(eur(c.spent)),
        right(remainingText(left), { bold: left < 0, color: left < 0 ? RED : INK }),
      ];
    });

    // ---- accounts (whole project)
    const accOpening = (a: AccountBalance) => a.openingBalance ?? 0;
    const accountRows = accounts.map((a) => [
      a.name,
      right(eur(accOpening(a))),
      right(eur(a.income ?? 0)),
      right(eur(a.expenses ?? 0)),
      right(eur(a.balance)),
    ]);
    const total = (f: (a: AccountBalance) => number) => accounts.reduce((s, a) => s + f(a), 0);

    // ---- transactions (filtered list)
    const txnRows = transactions.length
      ? transactions.map((t) => [
          day(t.date),
          {
            stack: [t.note || t.categoryName, ...(t.details ? [{ text: t.details, fontSize: 8, color: MUTED }] : [])],
          },
          t.categoryName,
          t.accountName,
          right(`${t.type === 'income' ? '+' : '−'}${eur(t.amount)}`, {
            color: t.type === 'income' ? GREEN : INK,
          }),
        ])
      : [[{ text: 'No transactions for these filters.', colSpan: 5, color: MUTED }, {}, {}, {}, {}]];

    return {
      pageSize: 'A4',
      pageMargins: [40, 36, 40, 48],
      defaultStyle: { fontSize: 9, color: INK },
      info: { title: 'Cementa budget report' },
      footer: (current: number, count: number) => ({
        margin: [40, 0, 40, 0],
        columns: [
          { text: 'Cementa', fontSize: 8, color: MUTED },
          { text: `Page ${current} of ${count}`, fontSize: 8, color: MUTED, alignment: 'right' },
        ],
      }),
      content: [
        {
          columns: [
            {
              stack: [
                { text: 'CEMENTA', fontSize: 9, bold: true, color: MUTED, characterSpacing: 1.5 },
                { text: 'Budget report', fontSize: 22, bold: true },
              ],
            },
            {
              text: `Generated ${day(this.today())}`,
              fontSize: 9,
              color: MUTED,
              alignment: 'right',
              margin: [0, 18, 0, 0],
            },
          ],
        },
        { canvas: [{ type: 'line', x1: 0, y1: 4, x2: 515, y2: 4, lineWidth: 2, lineColor: AMBER }] },
        {
          text: [
            'Account: ',
            { text: filters.account, bold: true, color: INK },
            '  ·  Month: ',
            { text: filters.month, bold: true, color: INK },
            '  ·  Category: ',
            { text: filters.category, bold: true, color: INK },
            '  ·  Search: ',
            { text: filters.search || '—', bold: true, color: INK },
          ],
          color: MUTED,
          margin: [0, 8, 0, 0],
        },
        {
          margin: [0, 12, 0, 0],
          table: {
            widths: ['*', '*', '*', '*'],
            body: [
              [
                summaryCell('Income', signed(income)),
                summaryCell('Expenses', signed(-expenses)),
                summaryCell('Net', signed(net)),
                summaryCell('Transactions', String(transactions.length)),
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            hLineColor: () => INK,
            vLineWidth: () => 1,
            vLineColor: (i: number) => (i === 0 || i === 4 ? INK : LINE),
            paddingLeft: () => 10,
            paddingRight: () => 10,
            paddingTop: () => 8,
            paddingBottom: () => 8,
          },
        },

        section('Budget by category', 'whole project'),
        {
          table: {
            headerRows: 1,
            widths: ['*', 80, 80, 90],
            body: [
              [th('Category'), th('Budget', true), th('Spent', true), th('Remaining', true)],
              ...categoryRows,
              [
                { text: 'Total', bold: true },
                right(eur(totalBudget), { bold: true }),
                right(eur(totalSpent), { bold: true }),
                right(remainingText(totalBudget - totalSpent), { bold: true }),
              ],
            ],
          },
          layout: tableLayout(true),
        },

        section('Accounts', 'whole project'),
        {
          table: {
            headerRows: 1,
            widths: ['*', 70, 70, 70, 80],
            body: [
              [th('Account'), th('Opening', true), th('Income', true), th('Expenses', true), th('Remaining', true)],
              ...accountRows,
              [
                { text: 'Total', bold: true },
                right(eur(total(accOpening)), { bold: true }),
                right(eur(total((a) => a.income ?? 0)), { bold: true }),
                right(eur(total((a) => a.expenses ?? 0)), { bold: true }),
                right(eur(total((a) => a.balance)), { bold: true }),
              ],
            ],
          },
          layout: tableLayout(true),
        },

        section('Transactions', 'filtered list'),
        {
          table: {
            headerRows: 1,
            dontBreakRows: true,
            widths: [62, '*', 62, 44, 74],
            body: [
              [th('Date'), th('Note'), th('Category'), th('Account'), th('Amount', true)],
              ...txnRows,
              [
                { text: `Income ${signed(income)}  ·  Expenses ${signed(-expenses)}  ·  Net`, colSpan: 4, bold: true },
                {},
                {},
                {},
                right(signed(net), { bold: true }),
              ],
            ],
          },
          layout: tableLayout(true),
        },
      ],
    };
  }

  private loadPdfMake(): Promise<any> {
    // loaded on first use, so the library is not part of the app's startup
    return (this.pdfMake ??= (async () => {
      const [lib, fonts]: any[] = await Promise.all([
        import('pdfmake/build/pdfmake'),
        import('pdfmake/build/vfs_fonts'),
      ]);
      const pdfMake = lib.default ?? lib;
      pdfMake.addVirtualFileSystem(fonts.default ?? fonts);
      return pdfMake;
    })().catch((e) => {
      this.pdfMake = undefined; // allow a retry after a failed load
      throw e;
    }));
  }

  private today(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
