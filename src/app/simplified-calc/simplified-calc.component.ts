import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { Recipe, RecipesStore } from '../data/recipes';
import { RecipesListComponent } from './recipes-list/recipes-list.component';

@Component({
    selector: 'app-simplified-calc',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RecipesListComponent,
    ],
    templateUrl: './simplified-calc.component.html'
})
export class SimplifiedCalcComponent {
  recipesStore = inject(RecipesStore);
  recipes: Signal<Recipe[]> = this.recipesStore.entities;
}
