import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';
import { RecipesStore } from '../../data/recipes';
import { productDialogManager } from '../product-dialog/dialog-manager';

@Component({
    selector: 'app-product-link',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TippyDirective],
    templateUrl: './product-link.component.html'
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
