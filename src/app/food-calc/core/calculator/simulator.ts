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

  findBestFoodAlternative(possibleFood: FoodItem[], count = 5) {
    const memo = new Map<string, number>();
    let bestCombination = { foodItems: [] as FoodItem[], total: 0 };
    const maxTime = 15000;
    const startTime = Date.now();
    let processedCount = 0;

    // Pre-calculate initial state total for optimization
    const initialTotal = this.totalCalculator.calculateTotal(this.state, this.foodToTaste);

    // Sort and pre-calculate individual values for better performance
    const foodValues = possibleFood
      .map((food) => {
        const state = this.state.copy();
        state.addFood(food);
        return {
          food,
          value: this.totalCalculator.calculateTotal(state, this.foodToTaste),
          calories: this.foodToCalories.get(food.name) || 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    // Take top 50% of foods for better performance while maintaining quality
    const sortedFoods = foodValues
      .slice(0, Math.max(5, Math.floor(foodValues.length * 0.5)))
      .map((item) => item.food);

    const findCombinationRecursive = (
      currentFoods: FoodItem[],
      availableFoods: FoodItem[],
      currentState: StomachState,
      currentTotal: number,
      remainingCount: number,
      depth = 0,
    ) => {
      // Time check only every 1000 operations for better performance
      processedCount++;
      if (processedCount % 1000 === 0 && Date.now() - startTime > maxTime) {
        return false;
      }

      // If we have exactly count items, check if it's better than current best
      if (currentFoods.length === count) {
        if (currentTotal > bestCombination.total) {
          bestCombination = { foodItems: [...currentFoods], total: currentTotal };
        }
        return true;
      }

      // If we can't reach count items, skip this branch
      if (currentFoods.length + remainingCount < count) {
        return true;
      }

      // Early stopping with more aggressive pruning
      if (
        currentTotal + this.estimateMaxPotentialGain(availableFoods, remainingCount, depth) <=
        bestCombination.total
      ) {
        return true;
      }

      // Try each food with optimized amounts
      for (let i = 0; i < availableFoods.length; i++) {
        const food = availableFoods[i];
        const maxAmount = Math.min(remainingCount, count - currentFoods.length);

        // Try different amounts of current food
        for (let amount = 1; amount <= maxAmount; amount++) {
          const newFoods = Array(amount).fill(food);
          const stateKey = this.getStateKey([...currentFoods, ...newFoods]);

          if (memo.has(stateKey)) {
            const cachedTotal = memo.get(stateKey)!;
            if (cachedTotal <= currentTotal) continue;
          }

          const newState = currentState.copy();
          // Batch add foods for better performance
          for (let j = 0; j < amount; j++) {
            newState.addFood(food);
          }

          const newTotal = this.totalCalculator.calculateTotal(newState, this.foodToTaste);
          if (newTotal <= currentTotal) continue;

          memo.set(stateKey, newTotal);

          // Recursively try remaining foods
          const shouldContinue = findCombinationRecursive(
            [...currentFoods, ...newFoods],
            availableFoods.slice(i + 1),
            newState,
            newTotal,
            remainingCount - amount,
            depth + 1,
          );

          if (!shouldContinue) return false;
        }
      }

      return true;
    };

    // Initialize with base state
    const baseState = this.state.copy();
    findCombinationRecursive([], sortedFoods, baseState, initialTotal, count);

    // If we didn't find a valid combination, use the best food repeated count times
    if (bestCombination.foodItems.length !== count && sortedFoods.length > 0) {
      const bestFood = sortedFoods[0];
      const state = this.state.copy();
      const foods = Array(count).fill(bestFood);
      foods.forEach((f) => state.addFood(f));
      const total = this.totalCalculator.calculateTotal(state, this.foodToTaste);
      bestCombination = { foodItems: foods, total };
    }

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

  private calculateIndividualValues(foods: FoodItem[]): FoodItem[] {
    return foods
      .map((food) => {
        const state = this.state.copy();
        state.addFood(food);
        const value = this.totalCalculator.calculateTotal(state, this.foodToTaste);
        return { food, value };
      })
      .sort((a, b) => b.value - a.value)
      .map((item) => item.food);
  }

  private estimateMaxPotentialGain(
    remainingFoods: FoodItem[],
    remainingCount: number,
    depth: number,
  ): number {
    if (!remainingFoods.length || remainingCount === 0) return 0;

    const bestFood = remainingFoods[0];
    const bestValue = this.foodToCalories.get(bestFood.name) || 0;

    // More aggressive pruning based on depth
    const depthFactor = Math.max(0.5, 1 - depth * 0.1);
    return bestValue * remainingCount * depthFactor;
  }

  private getStateKey(foods: FoodItem[]): string {
    return foods
      .map((f) => f.name)
      .sort()
      .join(',');
  }
}
