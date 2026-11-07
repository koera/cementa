import { Component, ElementRef, EventEmitter, HostListener, inject, Input, Output, ViewChild } from '@angular/core';
import { CategoryItemComponent } from '../category-item/category-item.component';
import { CategoryBudget } from '../../models/category.model';
import { IonList } from '@ionic/angular';

@Component({
  selector: 'app-category-group',
  templateUrl: './category-group.component.html',
  styleUrls: ['./category-group.component.scss'],
  imports: [CategoryItemComponent, IonList],
})
export class CategoryGroupComponent {
  @Input() title = 'Categories';
  @Input({ required: true }) categories: CategoryBudget[] = [];
  @Output() categorySelect = new EventEmitter<CategoryBudget>();
  @Output() categoryDelete = new EventEmitter<CategoryBudget>();

  // @ViewChild(IonList) private list?: IonList;
  // private host = inject(ElementRef<HTMLElement>);

  // @HostListener('document:click', ['$event'])
  // onDocumentClick(e: Event) {
  //   if (!this.host.nativeElement.contains(e.target as Node)) {
  //     this.list?.closeSlidingItems();
  //   }
  // }
}
