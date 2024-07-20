import { Component, computed, inject, input } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';
import { RecipesStore } from '../../data/recipes';
import { productDialogManager } from '../product-dialog/dialog-manager';

@Component({
  selector: 'app-product-link',
  standalone: true,
  imports: [TippyDirective],
  templateUrl: './product-link.component.html',
  styleUrl: './product-link.component.scss',
})
export class ProductLinkComponent {
  dialogManager = productDialogManager();

  recipesStore = inject(RecipesStore);
  product = input.required<string>();
  static = input(false);

  hasRecipe = computed(() => {
    return this.recipesStore.hasRecipeForProduct(this.product());
  });
}
