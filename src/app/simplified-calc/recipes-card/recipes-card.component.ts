import { Component, computed, inject, Signal, viewChild } from '@angular/core';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { UserConfigStore } from '../../data/config';
import { Recipe, RecipesStore } from '../../data/recipes';

@Component({
  selector: 'app-recipes-card',
  standalone: true,
  imports: [NgSelectModule],
  templateUrl: './recipes-card.component.html',
  styleUrl: './recipes-card.component.scss',
})
export class RecipesCardComponent {
  recipesStore = inject(RecipesStore);
  userConfigStore = inject(UserConfigStore);
  recipes: Signal<Recipe[]> = this.recipesStore.entities;
  select = viewChild(NgSelectComponent);
  enabledRecipes: Signal<Recipe[]> = computed(() => {
    return this.userConfigStore
      .enabledRecipes()
      .map((v) => this.recipes().find((r) => r.id === v))
      .filter((v) => v) as Recipe[];
  });

  onChange($event: string) {
    if ($event) {
      this.select()?.clearModel();
      this.userConfigStore.enableRecipe($event);
    }
  }
}
