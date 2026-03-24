import { Component, inject, Signal } from '@angular/core';
import { Recipe, RecipesStore } from '../data/recipes';
import { RecipesListComponent } from './recipes-list/recipes-list.component';

@Component({
    selector: 'app-simplified-calc',
    imports: [
        RecipesListComponent,
    ],
    templateUrl: './simplified-calc.component.html',
    styleUrl: './simplified-calc.component.scss'
})
export class SimplifiedCalcComponent {
  recipesStore = inject(RecipesStore);
  recipes: Signal<Recipe[]> = this.recipesStore.entities;
}
