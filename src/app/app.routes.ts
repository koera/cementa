import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'accounts',
    loadComponent: () => import('./pages/accounts/accounts.page').then((m) => m.AccountsPage),
  },
  {
    path: 'transaction-details/:id',
    loadComponent: () =>
      import('./pages/transaction/transaction-details/transaction-details.page').then((m) => m.TransactionDetailsPage),
  },
];
