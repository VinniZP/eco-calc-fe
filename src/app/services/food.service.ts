import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { FoodStore } from '../data/food';

@Injectable({
  providedIn: 'root',
})
export class FoodService {
  foodStore = inject(FoodStore);
  http = inject(HttpClient);

  load() {
    return this.http.get<Record<string, any>>('/api/v1/plugins/EcoCalculator/food').pipe(
      tap((items) => {
        this.foodStore.setItems(
          Object.entries(items).map(([k, v]) => ({
            id: k,
            name: v.LocalizedName,
            tags: v.Tags,
            calories: v.Calories,
            nutrients: {
              protein: v.Nutrients.protein,
              carbs: v.Nutrients.carbs,
              fat: v.Nutrients.fat,
              vitamins: v.Nutrients.vitamins,
            },
          })),
        );
      }),
    );
  }
}
