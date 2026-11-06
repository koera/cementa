import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'accounts',
    loadComponent: () => import('./pages/accounts/accounts.page').then((m) => m.AccountsPage),
  },
];
