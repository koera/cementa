import { Component, inject, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
  ModalController,
  AlertController,
} from '@ionic/angular';
import { CurrencyPipe } from '@angular/common';
import { CategoryBudget, NewCategory } from '../../models/category.model';
import { CategoryGroupComponent } from '../../components/category-group/category-group.component';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { Router } from '@angular/router';
import { AccountGroupComponent } from '../../components/account-group/account-group.component';
import { CategoryFormComponent } from '../../components/category-form/category-form.component';
import { AccountService } from '../../services/account.service';
import { CategoryService } from '../../services/category.service';

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
    IonFabButton,
    AccountGroupComponent,
    IonFab,
    IonIcon
  ],
})
export class BudgetPage implements OnInit {
  isCategoryFormOpen = false;
  editingCategory: CategoryBudget | null = null;

  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private accountService = inject(AccountService);
  private modalController = inject(ModalController);
  private alertController = inject(AlertController);

  constructor() {
    addIcons({ add });
  }

  readonly categories = this.categoryService.categories;
  readonly accounts = this.accountService.accounts;

  get percent(): number {
    if (this.budget <= 0) return 0;
    return Math.min(100, Math.round((this.spent / this.budget) * 100));
  }

  get spent() {
    return this.categoryService.totalSpent() / 100;
  }
  get budget() {
    return this.categoryService.totalBudget() / 100;
  }

  async ngOnInit() {
    await Promise.all([this.categoryService.load(), this.accountService.load()]);
  }

  openAccounts() {
    this.router.navigate(['/accounts']);
  }

  async openCategoryForm(category: CategoryBudget | null = null) {
    const modal = await this.modalController.create({
      component: CategoryFormComponent,
      componentProps: {
        category,
        onSave: (n: NewCategory) => this.categoryService.save(n),
      },
    });
    await modal.present();
  }

  onCategorySelect(c: CategoryBudget) {
    this.editingCategory = c; // edit mode
    this.isCategoryFormOpen = true;
  }

  async onSaveCategory(n: NewCategory) {
    await this.categoryService.save(n);
    this.isCategoryFormOpen = false;
  }

  async onCategoryDelete(c: CategoryBudget) {
    if (c.spent > 0) {
      const info = await this.alertController.create({
        header: `Can't delete “${c.name}”`,
        message: 'This category has expenses. Delete those transactions first.',
        buttons: ['OK'],
      });
      await info.present();
      return;
    }
    const confirm = await this.alertController.create({
      header: 'Delete category?',
      message: `“${c.name}” and its budget will be removed.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.categoryService.remove(c.id),
        },
      ],
    });
    await confirm.present();
  }
}
