import { Testiness } from '../../../data/user';
import { FoodCalcConfig } from '../config';
import { Nutrients } from '../nutrients';
import { FoodItem, TastinessMult } from '../stomach';
import { StomachState } from './state';

export class FoodCalculator {
  private _foodToCalories: Map<string, number>;
  private _foodToTaste: Map<string, number>;
  private _food: FoodItem[];
  state: StomachState;
  totalCalculator: TotalCalculator;

  constructor(foodItems: FoodItem[], tasteConfig: Testiness[], config: typeof FoodCalcConfig) {
    this.state = new StomachState();
    this._food = foodItems;
    this._foodToCalories = new Map(foodItems.map((item) => [item.name, item.calories]));
    this._foodToTaste = new Map(
      tasteConfig.map((item) => [item.name, TastinessMult[item.testiness]]),
    );
    this.totalCalculator = new TotalCalculator(config);
  }

  calculate(): void {
    this.state.total = this.totalCalculator.calculateTotal(this.state, this._foodToTaste);
  }

  private totalCals(): number {
    return this.state.content.reduce((acc, food) => acc + (this._foodToCalories.get(food) || 0), 0);
  }

  private contentCalories(): Record<string, number> {
    return this.state.content.reduce(
      (acc, food) => {
        acc[food] = acc[food] || 0;
        acc[food] += this._foodToCalories.get(food) || 0;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  private contentCaloriesList(): { name: string; calories: number; taste: number }[] {
    return Object.entries(this.contentCalories())
      .map(([name, calories]) => ({
        name,
        calories,
        taste: this._foodToTaste.get(name) || 1,
      }))
      .sort((a, b) => b.calories - a.calories);
  }
}

// Обновленный класс TotalCalculator с учетом новых данных
export class TotalCalculator {
  constructor(private config: typeof FoodCalcConfig) {}

  calculateTotal(state: StomachState, foodToTaste: Map<string, number>): number {
    const contentCalories = state.caloriesPerFood;
    const normalizedNutrients = Nutrients.multiply(
      state.nutrients,
      1 / this.totalCalories(state, contentCalories),
    );
    const subtotal = normalizedNutrients.nutrientTotal();
    const balanceMult = this.calculateBalanceMult(normalizedNutrients);
    const varietyMult = this.calculateVarietyMult(contentCalories);
    const testinessMult = this.calculateTestinessMult(
      contentCalories,
      foodToTaste,
      this.totalCalories(state, contentCalories),
    );

    return subtotal * balanceMult * varietyMult * testinessMult * 1.3 + this.config.foodBaseValue;
  }

  calculateBalanceMult(normalizedNutrients: Nutrients): number {
    const values = normalizedNutrients.values();
    const min = Math.min(...values);
    const max = Math.max(...values);
    const balanceRating = min / max;
    return this.interpolate(
      balanceRating,
      this.config.minBalancedDietMultiplier,
      this.config.maxBalancedDietMultiplier,
    );
  }

  calculateVarietyMult(contentCalories: Record<string, number>): number {
    const acceptedFoodCount = Object.keys(contentCalories).filter(
      (item) => contentCalories[item] > this.config.minCaloriesToBeIncludedInVariertyBonus,
    ).length;

    return this.varietyMapper(acceptedFoodCount);
  }

  calculateTestinessMult(
    contentCalories: Record<string, number>,
    foodToTaste: Map<string, number>,
    totalCalories: number,
  ): number {
    let totalTastinessMult = 0;

    for (const [food, cal] of Object.entries(contentCalories)) {
      const taste = foodToTaste.get(food) || 1;
      totalTastinessMult += taste * cal;
    }

    return totalCalories === 0 ? 1 : totalTastinessMult / totalCalories;
  }

  private totalCalories(state: StomachState, contentCalories: Record<string, number>): number {
    return Object.values(contentCalories).reduce((acc, cal) => acc + cal, 0);
  }

  private varietyMapper(count: number): number {
    if (this.config.varietyInputHalflife <= 0) return this.config.varietyOutputAtMin;

    const val = Math.max(count, this.config.varietyInputMin);
    const distance = val - this.config.varietyInputMin;
    const halfLivesInDistance = distance / this.config.varietyInputHalflife;
    const percentTowardsHardCap = 1 - Math.pow(0.5, halfLivesInDistance);
    const range = this.config.varietyOutputLimit - this.config.varietyOutputAtMin;

    return this.config.varietyOutputAtMin + range * percentTowardsHardCap;
  }

  private interpolate(x: number, y1: number, y2: number): number {
    return x * (y2 - y1) + y1;
  }
}
