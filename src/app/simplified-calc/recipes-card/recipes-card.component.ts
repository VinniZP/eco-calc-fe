import { ChangeDetectionStrategy, Component, computed, inject, signal, Signal } from '@angular/core';
import { UserConfigStore } from '../../data/config';
import { Recipe, RecipesStore } from '../../data/recipes';
import { CardComponent, DividerComponent, SelectComponent } from '../../shared/ui';

@Component({
    selector: 'app-recipes-card',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SelectComponent, CardComponent, DividerComponent],
    templateUrl: './recipes-card.component.html',
    styleUrl: './recipes-card.component.scss'
})
export class RecipesCardComponent {
  recipesStore = inject(RecipesStore);
  userConfigStore = inject(UserConfigStore);
  recipes: Signal<Recipe[]> = this.recipesStore.entities;
  enabledRecipes: Signal<Recipe[]> = computed(() => {
    return this.userConfigStore
      .enabledRecipes()
      .map((v) => this.recipes().find((r) => r.id === v))
      .filter((v) => v) as Recipe[];
  });

  selectedRecipeId = signal<Recipe | null>(null);
  trackById = (r: Recipe) => r.id;
  recipeLabel = (r: Recipe) => r.displayName;

  onRecipeSelected(recipe: Recipe | null) {
    if (recipe) {
      this.userConfigStore.enableRecipe(recipe.id);
      this.selectedRecipeId.set(null);
    }
  }
}
