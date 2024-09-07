import { computed, effect, Injectable, signal, untracked } from '@angular/core';
import { createEffect } from 'ngxtension/create-effect';
import { createNotifier } from 'ngxtension/create-notifier';
import { debounceTime, pipe, tap } from 'rxjs';
import { Testiness } from '../../data/user';
import { FoodCalcConfig } from './config';
import { interpolate } from './helpers/math';
import { Nutrients } from './nutrients';

function round(value: number, decimals: number): number {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}

function toSinglePrecision(value: number) {
  return value;
  return Math.round(value * 100) / 100;
  const f32 = new Float32Array(1);
  f32[0] = value;
  return f32[0];
}

export const TastinessMult = {
  Wroth: 0.7,
  Horrible: 0.8,
  Bad: 0.9,
  Ok: 1,
  Good: 1.1,
  Delicious: 1.2,
  Favorite: 1.3,
};

export class FoodItem {
  name: string;
  nutrients: Nutrients;
  calories: number;

  constructor(name: string, nutrients: Nutrients, calories: number) {
    this.name = name;
    this.nutrients = nutrients;
    this.calories = calories;
  }
}

@Injectable()
export class Stomach {
  minTestiness = signal(0.7);
  minCalories = signal(100);
  minNutrients = signal(0);
  nutrients = new Nutrients(0, 0, 0, 0);
  content = signal<string[]>([]);
  foodToCalories = new Map<string, number>();
  foodToTaste = new Map<string, number>();
  food: FoodItem[] = [];
  calculating = signal(false);
  calculateFx = createEffect<void>(
    pipe(
      tap(() => this.calculating.set(true)),
      debounceTime(30),
      tap(() => this.calculate()),
    ),
  );

  refresh = createNotifier();
  subtotal = signal(0);
  balanceMult = signal(0);
  varietyMult = signal(0);
  testinessMult = signal(0);
  total = computed(
    () =>
      this.subtotal() * this.varietyMult() * this.testinessMult() * this.balanceMult() * 1.3 +
      FoodCalcConfig.foodBaseValue,
  );
  calculatedNext = signal<
    {
      name: string;
      value: number;
      nutrients: number;
      balanceMult: number;
      varietyMult: number;
      testinessMult: number;
    }[]
  >([]);
  contentCalories = computed(() => {
    this.refresh.listen();
    return this.content().reduce(
      (acc, food) => {
        acc[food] = acc[food] || 0;
        acc[food] += this.foodToCalories.get(food) || 0;
        return acc;
      },
      {} as Record<string, number>,
    );
  });
  contentCaloriesList = computed(() => {
    return Object.entries(this.contentCalories())
      .map(([name, calories]) => ({
        name,
        calories,
        taste: this.foodToTaste.get(name) || 1,
      }))
      .sort((a, b) => b.calories - a.calories);
  });
  totalCals = computed(() => {
    return this.contentCaloriesList().reduce((acc, item) => acc + item.calories, 0);
  });
  sortByNutrientsTimes = 0;

  constructor() {
    effect(() => {
      this.minNutrients();
      this.minCalories();
      this.minTestiness();
      untracked(() => {
        this.calculateFx();
      });
    });
  }

  toGraph() {
    const nutrients = Nutrients.multiply(this.nutrients, 1 / this.totalCals());
    return [
      { name: 'Углеводы', count: nutrients.carbs, color: '#f64f16' },
      { name: 'Витамины', count: nutrients.vitamins, color: '#a6cf0c' },
      { name: 'Жиры', count: nutrients.fat, color: '#fed01a' },
      { name: 'Белки', count: nutrients.protein, color: '#ffb800' },
    ];
  }

  setContent(content: string[]) {
    this.content.set(content);
    this.resetContent();
  }

  setFood(food: FoodItem[], tasteConfig: Testiness[]) {
    this.food = food;
    this.foodToCalories = new Map(food.map((item) => [item.name, item.calories]));
    this.foodToTaste = new Map(
      tasteConfig.map((item) => [item.name, TastinessMult[item.testiness]]),
    );
    this.resetContent();
  }

  resetContent() {
    this.content().forEach((food) => {
      this.eat(food, false);
    });
    this.refresh.notify();
  }

  private _eatBulk = false;

  get isEatBulk() {
    return this._eatBulk;
  }

  set isEatBulk(value: boolean) {
    this._eatBulk = value;
    if (value === false) {
      this.calculateFx();
    }
  }

  reset() {
    this.nutrients = new Nutrients(0, 0, 0, 0);
    this.content.set([]);
    this.calculateFx();
  }

  eat(food: string, addContent = true) {
    const foodItem = this.food.find((item) => item.name === food);
    if (!foodItem) {
      return;
    }

    this.nutrients = Nutrients.add(
      this.nutrients,
      Nutrients.multiply(foodItem.nutrients, foodItem.calories),
    );
    if (addContent) {
      this.content.set([...this.content(), food]);
    }
    this.calculateFx();
  }

  calculate() {
    const nutrients = Nutrients.multiply(this.nutrients, 1 / this.totalCals());
    this.subtotal.set(nutrients.nutrientTotal());

    const balanceMult = calculateBalance(nutrients);
    this.balanceMult.set(balanceMult);

    const varietyMult = calculateVariety(this.contentCaloriesList());
    this.varietyMult.set(varietyMult);

    const testinessMult = calculateTestiness(
      this.contentCalories(),
      this.foodToTaste,
      this.totalCals(),
    );
    this.testinessMult.set(testinessMult);

    if (balanceMult > 1.498 && this.sortByNutrientsTimes <= 0) {
      this.sortByNutrientsTimes = 3;
    } else {
      this.sortByNutrientsTimes--;
    }

    const calculatedNext = this.food
      .filter(
        (v) =>
          v.calories > this.minCalories() &&
          (this.foodToTaste.get(v.name) || 0) >= this.minTestiness() &&
          v.nutrients.nutrientTotal() > this.minNutrients(),
      )
      .map((item) => {
        const value = this.simulateFor(item.name);
        return { name: item.name, ...value };
      })
      .sort((a, b) => {
        if (this.sortByNutrientsTimes > 0) {
          return b.nutrients - a.nutrients;
        }
        return (
          calculateEffectiveValue(b, this.foodToTaste.get(b.name) || 1) -
          calculateEffectiveValue(a, this.foodToTaste.get(b.name) || 1)
        );
        // return b.balanceMult - a.balanceMult;
      });
    this.calculatedNext.set(calculatedNext);
    this.calculating.set(false);
  }

  simulateFor(foodName: string) {
    const foodItem = this.getFoodItem(foodName);
    if (!foodItem) {
      return this.getDefaultSimulationResult();
    }

    const nutrients = this.calculateNutrients(foodItem);
    const balanceMult = calculateBalance(nutrients);
    const varietyMult = this.calculateVarietyMultiplier(foodName, foodItem);
    const testinessMult = this.calculateTestinessMultiplier(foodName, foodItem);

    return {
      value: this.calculateValue(nutrients, balanceMult, varietyMult, testinessMult),
      nutrients: this.calculateFoodNutrients(foodItem, foodName),
      finalNutrients: nutrients.nutrientTotal(),
      balanceMult,
      varietyMult,
      testinessMult,
    };
  }

  private getFoodItem(foodName: string) {
    return this.food.find((item) => item.name === foodName);
  }

  private getDefaultSimulationResult() {
    return {
      value: 0,
      varietyMult: 0,
      testinessMult: 0,
      balanceMult: 0,
      nutrients: 0,
      finalNutrients: 0,
    };
  }

  private calculateNutrients(foodItem: any) {
    let nutrients = Nutrients.add(
      this.nutrients,
      Nutrients.multiply(foodItem.nutrients, foodItem.calories),
    );
    return Nutrients.multiply(nutrients, 1 / (this.totalCals() + foodItem.calories));
  }

  private calculateVarietyMultiplier(foodName: string, foodItem: any) {
    return calculateVariety([
      ...this.contentCaloriesList(),
      {
        name: foodName,
        calories: foodItem.calories,
        taste: this.foodToTaste.get(foodName) || 1,
      },
    ]);
  }

  private calculateTestinessMultiplier(foodName: string, foodItem: any) {
    const modifiedContentCalories = { ...this.contentCalories() };
    modifiedContentCalories[foodName] =
      (modifiedContentCalories[foodName] || 0) + foodItem.calories;
    return calculateTestiness(
      modifiedContentCalories,
      this.foodToTaste,
      this.totalCals() + foodItem.calories,
    );
  }

  private calculateValue(nutrients: any, balanceMult: number, varietyMult: number, testinessMult: number) {
    return nutrients.nutrientTotal() * balanceMult * varietyMult * testinessMult * 1.3 +
      FoodCalcConfig.foodBaseValue;
  }

  private calculateFoodNutrients(foodItem: any, foodName: string) {
    return foodItem.nutrients.nutrientTotal() * (this.foodToTaste.get(foodName) || 1);
  }
}

function calculateEffectiveValue(item: any, foodTaste: number): number {
  return item.finalNutrients * item.testinessMult * item.balanceMult * foodTaste;
}

function calculateContentCalories(
  content: string[],
  foodToCalories: Map<string, number>,
): Record<string, number> {
  return content.reduce(
    (acc, food) => {
      acc[food] = acc[food] || 0;
      acc[food] += foodToCalories.get(food) || 0;
      return acc;
    },
    {} as Record<string, number>,
  );
}

function calculateBalance(nutrients: Nutrients): number {
  const values = nutrients.values();
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (max <= 0) {
    return 1;
  }
  const balanceRating = min / max;
  return toSinglePrecision(
    interpolate(
      balanceRating,
      FoodCalcConfig.minBalancedDietMultiplier,
      FoodCalcConfig.maxBalancedDietMultiplier,
      false,
    ),
  );
}

function calculateVariety(
  contentCaloriesList: { name: string; calories: number; taste: number }[],
): number {
  const acceptedFood = contentCaloriesList.filter(
    (x) => x.calories > FoodCalcConfig.minCaloriesToBeIncludedInVariertyBonus,
  );
  const foodTypesEatenOverLimit = acceptedFood.length;

  return toSinglePrecision(varietyMapper(foodTypesEatenOverLimit));
}

function varietyMapper(count: number): number {
  if (FoodCalcConfig.varietyInputHalflife <= 0) return FoodCalcConfig.varietyOutputAtMin;

  let val = Math.max(count, FoodCalcConfig.varietyInputMin);
  const distance = val - FoodCalcConfig.varietyInputMin;

  const halfLivesInDistance = distance / FoodCalcConfig.varietyInputHalflife;
  const percentTowardsHardCap = 1 - Math.pow(0.5, halfLivesInDistance);
  const range = FoodCalcConfig.varietyOutputLimit - FoodCalcConfig.varietyOutputAtMin;
  return toSinglePrecision(FoodCalcConfig.varietyOutputAtMin + range * percentTowardsHardCap);
}

function calculateTestiness(
  contentCalories: Record<string, number>,
  foodToTaste: Map<string, number>,
  totalCals: number,
): number {
  let totalTastinessMult = 0;
  Object.entries(contentCalories).forEach(([food, cal]) => {
    const taste = foodToTaste.get(food) || 1;
    totalTastinessMult += taste * cal;
  });
  return toSinglePrecision(totalCals === 0 ? 1 : totalTastinessMult / totalCals);
}
