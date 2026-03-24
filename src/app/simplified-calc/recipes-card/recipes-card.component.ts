import { ChangeDetectionStrategy, Component, computed, inject, signal, Signal } from '@angular/core';
import { UserConfigStore } from '../../data/config';
import { Recipe, RecipesStore } from '../../data/recipes';
import { CardComponent } from '../../shared/ui/card/card.component';
import { DividerComponent } from '../../shared/ui/divider/divider.component';
import { SelectComponent } from '../../shared/ui/select/select.component';

@Component({
    selector: 'app-recipes-card',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SelectComponent, CardComponent, DividerComponent],
    templateUrl: './recipes-card.component.html'
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
