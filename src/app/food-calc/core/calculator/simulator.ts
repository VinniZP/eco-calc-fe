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
    const maxTime = 30000; // Max 22 seconds of computation
    const startTime = Date.now();
    const batchSize = 10000; // Process in batches to prevent UI freezing
    let processedCount = 0;

    // Pre-calculate initial state total for optimization
    const initialTotal = this.totalCalculator.calculateTotal(this.state, this.foodToTaste);

    // Sort foods by their individual value for better performance
    const sortedFoods = this.calculateIndividualValues(possibleFood);

    // Track count of each food in current combination
    const foodCounts = new Map<string, number>();

    const findCombinationRecursive = (
      currentFoods: FoodItem[],
      availableFoods: FoodItem[],
      currentState: StomachState,
      currentTotal: number,
      remainingCount: number,
    ) => {
      // Check time limit and batch size
      processedCount++;
      if (Date.now() - startTime > maxTime || processedCount % batchSize === 0) {
        return false; // Signal to stop processing
      }

      // Early stopping if we can't beat the best combination
      const potentialGain = this.estimateMaxPotentialGain(availableFoods, remainingCount);
      if (currentTotal + potentialGain <= bestCombination.total) {
        return true;
      }

      // Check if current combination is better
      if (currentTotal > bestCombination.total) {
        bestCombination = { foodItems: [...currentFoods], total: currentTotal };
      }

      if (remainingCount === 0) {
        return true;
      }

      // Try adding each available food
      for (let i = 0; i < availableFoods.length; i++) {
        const food = availableFoods[i];
        const currentCount = foodCounts.get(food.name) || 0;

        // Try adding this food 1 to remainingCount times
        for (let amount = 1; amount <= remainingCount; amount++) {
          const newState = currentState.copy();
          const newFoods = Array(amount).fill(food);
          newFoods.forEach((f) => newState.addFood(f));

          const stateKey = this.getStateKey([...currentFoods, ...newFoods]);
          if (memo.has(stateKey)) {
            const cachedTotal = memo.get(stateKey)!;
            if (cachedTotal <= currentTotal) continue;
          }

          const newTotal = this.totalCalculator.calculateTotal(newState, this.foodToTaste);
          if (newTotal <= currentTotal) continue; // Skip if doesn't improve

          memo.set(stateKey, newTotal);
          foodCounts.set(food.name, currentCount + amount);

          const shouldContinue = findCombinationRecursive(
            [...currentFoods, ...newFoods],
            availableFoods.slice(i + 1), // Move to next food type
            newState,
            newTotal,
            remainingCount - amount,
          );

          foodCounts.set(food.name, currentCount); // Restore count
          if (!shouldContinue) return false;
        }
      }

      return true;
    };

    findCombinationRecursive([], sortedFoods, this.state.copy(), initialTotal, count);

    // If we didn't find any combination, try the best single food
    if (bestCombination.foodItems.length === 0 && sortedFoods.length > 0) {
      const bestFood = sortedFoods[0];
      const state = this.state.copy();
      // Try adding the best food multiple times
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

  private estimateMaxPotentialGain(remainingFoods: FoodItem[], remainingCount: number): number {
    const bestFood = remainingFoods[0];
    if (!bestFood) return 0;

    // Estimate based on using the best food for all remaining slots
    const bestValue = this.foodToCalories.get(bestFood.name) || 0;
    return bestValue * remainingCount * 0.9; // 0.9 factor for slight pruning
  }

  private getStateKey(foods: FoodItem[]): string {
    return foods
      .map((f) => f.name)
      .sort()
      .join(',');
  }
}
