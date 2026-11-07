import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoryBudget } from '../../models/category.model';
import { IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-category-item',
  templateUrl: './category-item.component.html',
  styleUrls: ['./category-item.component.scss'],
  imports: [CurrencyPipe, IonItemSliding, IonItem, IonItemOptions, IonItemOption, IonIcon],
})
export class CategoryItemComponent {
  constructor() {
    addIcons({ trashOutline });
  }
  @Input({ required: true }) category!: CategoryBudget;
  @Output() categorySelect = new EventEmitter<CategoryBudget>();
  @Output() categoryDelete = new EventEmitter<CategoryBudget>();

  get remaining(): number {
    return this.category.budget - this.category.spent;
  }

  get barColor(): string {
    return this.isOver ? '#B42318' : this.category.color || '#1F2933';
  }

  get isOver(): boolean {
    return this.remaining < 0;
  }

  get percent(): number {
    const { budget, spent } = this.category;
    if (budget <= 0) return spent > 0 ? 100 : 0;
    return Math.min(100, Math.round((spent / budget) * 100));
  }

  // 'ok' (slate), 'warn' (amber, 85% or more), 'over' (red)
  get state(): 'ok' | 'warn' | 'over' {
    if (this.isOver) return 'over';
    return this.percent >= 85 ? 'warn' : 'ok';
  }

  onDelete(slider: IonItemSliding) {
    slider.close(); // slide the row back
    this.categoryDelete.emit(this.category);
  }
}
