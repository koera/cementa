import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonTitle,
  IonToolbar,
  ModalController,
  IonSpinner,
} from '@ionic/angular';
import { CategoryBudget, NewCategory } from '../../models/category.model';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonFooter, IonSpinner],
})
export class CategoryFormComponent implements OnInit {
  private modalController = inject(ModalController);

  constructor() {
    addIcons({ trashOutline });
  }

  @Input() category: CategoryBudget | null = null;
  @Input({ required: true }) onSave!: (n: NewCategory) => Promise<void>;

  saving = false;
  failed = false;

  readonly colors = [
    { value: '#F59E0B', label: 'Amber' },
    { value: '#2B3A47', label: 'Slate' },
    { value: '#17694B', label: 'Green' },
    { value: '#3B6FB6', label: 'Blue' },
    { value: '#8A5A3C', label: 'Brown' },
  ];

  name = '';
  budget: number | null = null;
  color = this.colors[0].value;

  get isEdit(): boolean {
    return this.category !== null;
  }

  ngOnInit() {
    if (this.category) {
      this.name = this.category.name;
      this.budget = this.category.budget / 100;
      this.color = this.category.color ?? this.colors[0].value;
    }
  }

  get canSave(): boolean {
    return this.name.trim().length > 0 && !!this.budget && this.budget > 0;
  }

  get isCustom(): boolean {
    return !this.colors.some((c) => c.value.toLowerCase() === this.color.toLowerCase());
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  async save() {
    if (!this.canSave || this.saving) return;
    this.saving = true;
    this.failed = false;
    try {
      await this.onSave({
        id: this.category?.id,
        name: this.name.trim(),
        budgetCents: Math.round(this.budget! * 100),
        color: this.color,
      });
      await this.modalController.dismiss(null, 'save');
    } catch (e) {
      console.error(e);
      this.failed = true; // stay open so the user keeps what they typed
    } finally {
      this.saving = false;
    }
  }
}
