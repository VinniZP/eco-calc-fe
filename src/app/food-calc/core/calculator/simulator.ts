import { Testiness } from '../../../data/user';
import { FoodCalcConfig } from '../config';
import { Nutrients } from '../nutrients';
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
    const maxTime = 20000;
    const startTime = Date.now();
    let processedCount = 0;

    // Determine strategy at the start
    const initialBalance = this.state.nutrients.nutrientBalance();
    console.log('Initial balance:', initialBalance);

    let targetNutrient: keyof Nutrients | null = null;
    if (initialBalance > 0.99) {
      targetNutrient = this.state.nutrients.minNutrientType();
      console.log('Targeting nutrient:', targetNutrient);
    }

    // Helper function to calculate total based on chosen strategy
    const calculateAdjustedTotal = (state: StomachState): number => {
      const total = this.totalCalculator.calculateTotal(state, this.foodToTaste);
      const subtotal = this.totalCalculator.calculateSubtotal(state);

      if (targetNutrient) {
        // Use consistent nutrient targeting strategy
        switch (targetNutrient) {
          case 'vitamins':
            return state.nutrients.vitamins * 1000;
          case 'protein':
            return state.nutrients.protein * 800;
          case 'carbs':
            return state.nutrients.carbs * 800;
          case 'fat':
            return state.nutrients.fat * 800;
        }
      }

      return total + subtotal * 2;
    };

    // Pre-calculate initial state total for optimization
    const initialTotal = calculateAdjustedTotal(this.state);

    // Sort and pre-calculate individual values for better performance
    const foodValues = possibleFood
      .map((food) => {
        const state = this.state.copy();
        state.addFood(food);
        return {
          food,
          value: calculateAdjustedTotal(state),
          calories: this.foodToCalories.get(food.name) || 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    // Take top foods based on strategy
    const topCount = targetNutrient
      ? Math.max(20, Math.floor(foodValues.length * 0.95)) // Take more foods when targeting nutrients
      : Math.max(15, Math.floor(foodValues.length * 0.9));

    const sortedFoods = foodValues.slice(0, topCount).map((item) => item.food);

    const generateCombinations = (
      currentFoods: FoodItem[],
      availableFoods: FoodItem[],
      currentState: StomachState,
      currentTotal: number,
      remainingCount: number,
      startIndex = 0,
    ): void => {
      processedCount++;

      if (Date.now() - startTime > maxTime) {
        return;
      }

      if (currentFoods.length === count) {
        const adjustedTotal = calculateAdjustedTotal(currentState);
        if (adjustedTotal > bestCombination.total) {
          bestCombination = { foodItems: [...currentFoods], total: adjustedTotal };
        }
        return;
      }

      if (currentFoods.length + (availableFoods.length - startIndex) < count) {
        return;
      }

      for (let i = startIndex; i < availableFoods.length; i++) {
        const food = availableFoods[i];
        // Allow more of the same food when targeting nutrients
        const maxAmount = targetNutrient
          ? Math.min(4, count - currentFoods.length)
          : Math.min(3, count - currentFoods.length);

        for (let amount = 1; amount <= maxAmount; amount++) {
          const newFoods = Array(amount).fill(food);
          const stateKey = this.getStateKey([...currentFoods, ...newFoods]);

          if (memo.has(stateKey)) {
            const cachedTotal = memo.get(stateKey)!;
            if (cachedTotal <= currentTotal) continue;
          }

          const newState = currentState.copy();
          for (let j = 0; j < amount; j++) {
            newState.addFood(food);
          }

          const newTotal = calculateAdjustedTotal(newState);
          memo.set(stateKey, newTotal);

          generateCombinations(
            [...currentFoods, ...newFoods],
            availableFoods,
            newState,
            newTotal,
            remainingCount - amount,
            i + 1,
          );
        }
      }
    };

    // Generate combinations until time runs out
    while (Date.now() - startTime <= maxTime) {
      for (let startIdx = 0; startIdx < sortedFoods.length; startIdx++) {
        if (Date.now() - startTime > maxTime) break;

        const baseState = this.state.copy();
        generateCombinations([], sortedFoods, baseState, initialTotal, count, startIdx);
      }

      // Only shuffle if not targeting specific nutrient
      if (!targetNutrient) {
        sortedFoods.sort(() => Math.random() - 0.5);
      }
    }

    console.log(`Processed combinations: ${processedCount}`);
    if (targetNutrient) {
      console.log(`Targeted nutrient: ${targetNutrient}`);
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
