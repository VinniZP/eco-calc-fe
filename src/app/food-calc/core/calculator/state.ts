import { Nutrients } from '../nutrients';
import { FoodItem } from '../stomach';

export class StomachState {
  private _nutrients: Nutrients;
  private _content: string[];
  private _total: number;
  private _calculatedNext: {
    name: string;
    value: number;
    nutrients: number;
    balanceMult: number;
    varietyMult: number;
    testinessMult: number;
  }[];

  constructor() {
    this._nutrients = new Nutrients(0, 0, 0, 0);
    this._content = [];
    this._total = 0;
    this._calculatedNext = [];
  }

  get nutrients(): Nutrients {
    return this._nutrients;
  }

  get content(): string[] {
    return [...this._content];
  }

  caloriesPerFood: Record<string, number> = {};

  get total(): number {
    return this._total;
  }

  set total(value: number) {
    this._total = value;
  }

  get calculatedNext(): {
    name: string;
    value: number;
    nutrients: number;
    balanceMult: number;
    varietyMult: number;
    testinessMult: number;
  }[] {
    return [...this._calculatedNext];
  }

  set calculatedNext(
    value: {
      name: string;
      value: number;
      nutrients: number;
      balanceMult: number;
      varietyMult: number;
      testinessMult: number;
    }[],
  ) {
    this._calculatedNext = [...value];
  }

  copy(): StomachState {
    const copy = new StomachState();
    copy._nutrients = new Nutrients(
      this._nutrients.carbs,
      this._nutrients.protein,
      this._nutrients.fat,
      this._nutrients.vitamins,
    );
    copy._content = [...this._content];
    copy._total = this._total;
    copy.caloriesPerFood = { ...this.caloriesPerFood };
    copy._calculatedNext = this._calculatedNext.map((item) => ({ ...item }));
    return copy;
  }

  addFood(foodItem: FoodItem): void {
    this._nutrients = Nutrients.add(
      this._nutrients,
      Nutrients.multiply(foodItem.nutrients, foodItem.calories),
    );
    this._content.push(foodItem.name);
    this.caloriesPerFood[foodItem.name] =
      (this.caloriesPerFood[foodItem.name] || 0) + foodItem.calories;
  }
}
