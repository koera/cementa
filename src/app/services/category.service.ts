import { Injectable, computed, inject, signal } from '@angular/core';
import { DatabaseService } from './database.service';
import { CategoryBudget, NewCategory } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private db = inject(DatabaseService);

  readonly categories = signal<CategoryBudget[]>([]);
  readonly totalBudget = computed(() => this.categories().reduce((s, c) => s + c.budget, 0));
  readonly totalSpent = computed(() => this.categories().reduce((s, c) => s + c.spent, 0));

  async load() {
    this.categories.set(
      await this.db.query<CategoryBudget>(`
      SELECT c.id, c.name, c.color,
             c.budget_amount AS budget,
             COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount END), 0) AS spent
      FROM category c
      LEFT JOIN txn t ON t.category_id = c.id
      GROUP BY c.id
      ORDER BY c.id`),
    );
  }

  async save(n: NewCategory) {
    if (n.id !== undefined) {
      await this.db.run('UPDATE category SET name = ?, budget_amount = ?, color = ? WHERE id = ?', [
        n.name,
        n.budgetCents,
        n.color,
        n.id,
      ]);
    } else {
      await this.db.run('INSERT INTO category (name, budget_amount, color) VALUES (?, ?, ?)', [
        n.name,
        n.budgetCents,
        n.color,
      ]);
    }
    await this.load();
  }

  async remove(id: number) {
    await this.db.run('DELETE FROM category WHERE id = ?', [id]);
    await this.load();
  }
}
