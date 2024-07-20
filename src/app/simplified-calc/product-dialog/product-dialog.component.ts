import { DIALOG_DATA, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { SlicePipe } from '@angular/common';
import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TippyDirective } from '@ngneat/helipopper';
import { UserConfigStore } from '../../data/config';
import { Recipe, RecipesStore } from '../../data/recipes';
import { ProductLinkComponent } from '../product-link/product-link.component';
import { RecipeCalculationsComponent } from './recipe-calculations/recipe-calculations.component';

interface DialogData {
  product: string;
}

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    NgSelectModule,
    FormsModule,
    RecipeCalculationsComponent,
    ProductLinkComponent,
    SlicePipe,
    TippyDirective,
  ],
  templateUrl: './product-dialog.component.html',
  styleUrl: './product-dialog.component.scss',
})
export class ProductDialogComponent implements OnInit {
  userConfigStore = inject(UserConfigStore);
  recipesStore = inject(RecipesStore);
  recipes: Recipe[] = this.recipesStore.getRecipesForProduct(this.data.product);
  usedIn: string[] = this.recipesStore.usedInProducts(this.data.product);
  showEnd = 5;
  selectedRecipe = signal<Recipe | undefined>(undefined);

  constructor(
    @Inject(DIALOG_DATA) public data: DialogData,
    public ref: DialogRef,
  ) {}

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
      width: '100%',
      maxWidth: 'calc(100vw - 32px)',
      id: 'product-dialog-' + data.product,
    };
  }

  selectRecipe($event: Recipe | undefined) {
    this.selectedRecipe.set($event);
  }
}
