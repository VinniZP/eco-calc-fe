import { SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';
import { UserConfigStore } from '../../data/config';
import { Recipe, RecipesStore } from '../../data/recipes';
import { DialogRef } from '../../shared/dialog.service';
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

  dialogData = input.required<DialogData>();
  dialogRef = input.required<DialogRef<void>>();

  get data() { return this.dialogData(); }
  get ref() { return this.dialogRef(); }

  recipes: Recipe[] = [];
  usedIn: string[] = [];
  showEnd = 5;
  selectedRecipe = signal<Recipe | null>(null);

  ngOnInit() {
    this.recipes = this.recipesStore.getRecipesForProduct(this.data.product);
    this.usedIn = this.recipesStore.usedInProducts(this.data.product);

    const recipeName = this.userConfigStore.getProductSettings(this.data.product)?.recipeName;
    const recipe = this.recipes.find((r) => r.name === recipeName);
    if (recipe) {
      this.selectedRecipe.set(recipe);
    }
    if (!recipeName && this.recipes.length === 1) {
      this.selectedRecipe.set(this.recipes[0]);
    }
  }

  trackById = (r: Recipe) => r.id;
  recipeLabel = (r: Recipe) => r.displayName;
}
