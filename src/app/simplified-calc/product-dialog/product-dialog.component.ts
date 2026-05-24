import { DIALOG_DATA, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';
import { UserConfigStore } from '../../data/config';
import { Recipe, RecipesStore } from '../../data/recipes';
import { BadgeDirective } from '../../shared/ui/badge/badge.directive';
import { ButtonDirective } from '../../shared/ui/button/button.directive';
import { SelectOptionDirective } from '../../shared/ui/select/select-option.directive';
import { SelectComponent } from '../../shared/ui/select/select.component';
import { ProductLinkComponent } from '../product-link/product-link.component';
import { RecipeCalculationsComponent } from './recipe-calculations/recipe-calculations.component';

interface DialogData {
  product: string;
}

@Component({
    selector: 'app-product-dialog',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block bg-base-100 w-[min(95vw,1280px)] max-h-[95vh] overflow-y-auto rounded-xl border border-base-content/[0.08] shadow-2xl shadow-black/40' },
    imports: [
        SelectComponent,
        SelectOptionDirective,
        RecipeCalculationsComponent,
        ProductLinkComponent,
        SlicePipe,
        TippyDirective,
        BadgeDirective,
        ButtonDirective,
    ],
    templateUrl: './product-dialog.component.html'
})
export class ProductDialogComponent implements OnInit {
  userConfigStore = inject(UserConfigStore);
  recipesStore = inject(RecipesStore);
  data = inject<DialogData>(DIALOG_DATA);
  ref = inject(DialogRef);
  recipes: Recipe[] = this.recipesStore.getRecipesForProduct(this.data.product);
  usedIn: string[] = this.recipesStore.usedInProducts(this.data.product);
  showEnd = 5;
  selectedRecipe = signal<Recipe | null>(null);

  ngOnInit() {
    const recipeName = this.userConfigStore.getProductSettings(this.data.product)?.recipeName;
    const recipe = this.recipes.find((r) => r.name === recipeName);
    if (recipe) {
      this.selectedRecipe.set(recipe);
    }
    if (!recipeName && this.recipes.length === 1) {
      this.selectedRecipe.set(this.recipes[0]);
    }
  }

  static config(
    data: DialogData,
  ): Partial<DialogConfig<DialogData, DialogRef<void, ProductDialogComponent>>> {
    return {
      data,
      disableClose: true,
      maxWidth: 'calc(100vw - 32px)',
      id: 'product-dialog-' + data.product,
    };
  }

  trackById = (r: Recipe) => r.id;
  recipeLabel = (r: Recipe) => r.displayName;
}
