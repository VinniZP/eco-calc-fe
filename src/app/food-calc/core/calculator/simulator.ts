import { Testiness } from '../../../data/user';
import { FoodCalcConfig } from '../config';
import { FoodItem, TastinessMult } from '../stomach';
import { TotalCalculator } from './calculator';
import { StomachState } from './state';

export class FoodSimulator {
  private totalCalculator: TotalCalculator;
  state: StomachState;
  private foodToCalories: Map<string, number>;
  private foodToTaste: Map<string, number>;
  private food: FoodItem[];

  constructor(
    state: StomachState,
    foodItems: FoodItem[],
    tasteConfig: Testiness[],
    config: typeof FoodCalcConfig,
  ) {
    this.state = state.copy();
    this.food = foodItems;
    this.foodToCalories = new Map(foodItems.map((item) => [item.name, item.calories]));
    this.foodToTaste = new Map(
      tasteConfig.map((item) => [item.name, TastinessMult[item.testiness]]),
    );
    this.totalCalculator = new TotalCalculator(config);
  }

  calculateForFood(foodName: string): void {
    let state = this.state.copy();
    state.addFood(this.food.find((food) => food.name === foodName)!);
    state.total = this.totalCalculator.calculateTotal(state, this.foodToTaste);
  }

  findBestFood(possibleFood: FoodItem[], count = 5) {
    const topFoods = this.findTopFoods(possibleFood, this.state, 5);

    let bestCombination = { foodItems: [] as FoodItem[], total: 0 };

    topFoods.forEach((topFood) => {
      const combinations = this.generateCombinations(
        [topFood],
        topFoods.filter((food) => food !== topFood),
        count - 1,
      );
      combinations.forEach((combination) => {
        const simulatedState = this.state.copy();
        combination.forEach((foodItem) => simulatedState.addFood(foodItem));
        const total = this.totalCalculator.calculateTotal(simulatedState, this.foodToTaste);

        if (total > bestCombination.total) {
          bestCombination = { foodItems: combination, total };
        }
      });
    });
    return bestCombination;
  }

  private findTopFoods(
    possibleFood: FoodItem[],
    state: StomachState,
    topCount: number,
  ): FoodItem[] {
    const foodValues = possibleFood.map((foodItem) => {
      const simulatedState = state.copy();
      simulatedState.addFood(foodItem);
      const total = this.totalCalculator.calculateTotal(simulatedState, this.foodToTaste);
      return { foodItem, total };
    });

    foodValues.sort((a, b) => b.total - a.total);
    return foodValues.slice(0, topCount).map((value) => value.foodItem);
  }

  private generateCombinations(
    prefix: FoodItem[],
    remaining: FoodItem[],
    depth: number,
  ): FoodItem[][] {
    if (depth === 0) {
      return [prefix];
    }

    const combinations: FoodItem[][] = [];
    for (let i = 0; i < remaining.length; i++) {
      combinations.push(
        ...this.generateCombinations([...prefix, remaining[i]], remaining.slice(i), depth - 1),
      );
    }
    return combinations;
  }
}
