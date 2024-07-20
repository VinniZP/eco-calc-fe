import { Component, inject, Signal } from '@angular/core';
import { Recipe, RecipesStore } from '../data/recipes';
import { PlayerSettingsCardComponent } from './player-settings-card/player-settings-card.component';
import { PricesSettingsComponent } from './prices-settings/prices-settings.component';
import { RecipesCardComponent } from './recipes-card/recipes-card.component';
import { RecipesListComponent } from './recipes-list/recipes-list.component';

@Component({
  selector: 'app-simplified-calc',
  standalone: true,
  imports: [
    PlayerSettingsCardComponent,
    PricesSettingsComponent,
    RecipesCardComponent,
    RecipesListComponent,
  ],
  templateUrl: './simplified-calc.component.html',
  styleUrl: './simplified-calc.component.scss',
})
export class SimplifiedCalcComponent {
  recipesStore = inject(RecipesStore);
  recipes: Signal<Recipe[]> = this.recipesStore.entities;
}
