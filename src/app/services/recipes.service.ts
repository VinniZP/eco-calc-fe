import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { RecipesStore } from '../data/recipes';

@Injectable({
  providedIn: 'root',
})
export class RecipesService {
  recipesStore = inject(RecipesStore);
  http = inject(HttpClient);

  load() {
    return this.http.get<Record<string, any>>('/api/v1/plugins/EcoCalculator/recipes').pipe(
      tap((response) => {
        const recipes = Object.entries(response).map(([id, value]) => ({
          id,
          displayName: value.DisplayName,
          name: value.Name,
          laborCost: value.LaborCost,
          xpGain: value.XpGain,
          craftingTime: value.CraftingTime,
          skillNeeds: value.SkillNeeds.map((skill: any) => ({
            name: skill.Name,
            level: skill.Level,
          })),
          craftingTable: value.CraftingTable,
          ingredients: value.Ingredients.map((ingredient: any) => ({
            name: ingredient.Name,
            amount: ingredient.Amount,
            isSpecificItem: ingredient.IsSpecificItem,
            isStatic: ingredient.IsStatic,
            tag: ingredient.Tag,
          })),
          products: value.Products.map((product: any) => ({
            name: product.Name,
            amount: product.Amount,
            isStatic: product.IsStatic,
          })),
          product: {
            name: value.Product.Name,
            amount: value.Product.Amount,
            isStatic: value.Product.IsStatic,
          },
        }));
        this.recipesStore.setRecipes(recipes);
      }),
    );
  }
}
