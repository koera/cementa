import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoryItemComponent } from '../category-item/category-item.component';
import { CategoryBudget } from '../../models/category.model';

@Component({
  selector: 'app-category-group',
  templateUrl: './category-group.component.html',
  styleUrls: ['./category-group.component.scss'],
  imports: [CategoryItemComponent],
})
export class CategoryGroupComponent {
  @Input() title = 'Categories';
  @Input({ required: true }) categories: CategoryBudget[] = [];
  @Output() categorySelect = new EventEmitter<CategoryBudget>();
}
