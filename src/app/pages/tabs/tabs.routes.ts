import type { Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'transaction',
        loadComponent: () => import('../transaction/transaction').then((m) => m.TransactionPage),
      },
      {
        path: 'budget',
        loadComponent: () => import('../budget/budget.page').then((m) => m.BudgetPage),
      },
      {
        path: '',
        redirectTo: '/tabs/transaction',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/transaction',
    pathMatch: 'full',
  },
];
