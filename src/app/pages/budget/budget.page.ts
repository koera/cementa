import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, IonFab, IonFabButton, IonIcon, IonModal } from '@ionic/angular';
import { CurrencyPipe } from '@angular/common';
import { CategoryBudget, NewCategory } from '../../models/category.model';
import { CategoryGroupComponent } from '../../components/category-group/category-group.component';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { Router } from '@angular/router';
import { AccountBalance } from '../../models/account.model';
import { AccountGroupComponent } from '../../components/account-group/account-group.component';
import { CategoryFormComponent } from '../../components/category-form/category-form.component';

@Component({
  selector: 'app-budget',
  templateUrl: 'budget.page.html',
  styleUrls: ['budget.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    CurrencyPipe,
    CategoryGroupComponent,
    IonFab,
    IonFabButton,
    IonIcon,
    AccountGroupComponent,
    IonModal,
    CategoryFormComponent
  ],
})
export class BudgetPage {
  isCategoryFormOpen = false;
  editingCategory: CategoryBudget | null = null;

  private router = inject(Router);

  constructor() {
    addIcons({ add });
  }

  categories: CategoryBudget[] = [
    { id: 1, name: 'Materials', budget: 1200000, spent: 980000 },
    { id: 2, name: 'Labor', budget: 800000, spent: 835000 },
    { id: 3, name: 'Permits', budget: 150000, spent: 132000 },
    { id: 4, name: 'Equipment', budget: 250000, spent: 161000 },
    { id: 5, name: 'Other', budget: 600000, spent: 250000 },
  ];

  accounts: AccountBalance[] = [
    { id: 1, name: 'Bank', balance: 1492000 },
    { id: 2, name: 'Cash', balance: 350000 },
  ];

  get percent(): number {
    if (this.budget <= 0) return 0;
    return Math.min(100, Math.round((this.spent / this.budget) * 100));
  }

  // replace the fixed header values so they come from the categories (in euros, as before)
  get spent(): number {
    return this.categories.reduce((s, c) => s + c.spent, 0) / 100;
  }
  get budget(): number {
    return this.categories.reduce((s, c) => s + c.budget, 0) / 100;
  }

  openAccounts() {
    this.router.navigate(['/accounts']);
  }

  openCategoryForm() {
    this.editingCategory = null; // create mode
    this.isCategoryFormOpen = true;
  }

  onCategorySelect(c: CategoryBudget) {
    this.editingCategory = c; // edit mode
    this.isCategoryFormOpen = true;
  }

  onSaveCategory(n: NewCategory) {
    if (n.id !== undefined) {
      this.categories = this.categories.map((c) =>
        c.id === n.id ? { ...c, name: n.name, budget: n.budgetCents, color: n.color } : c,
      );
    } else {
      this.categories = [
        ...this.categories,
        { id: Date.now(), name: n.name, budget: n.budgetCents, spent: 0, color: n.color },
      ];
    }
    this.isCategoryFormOpen = false;
  }
}
