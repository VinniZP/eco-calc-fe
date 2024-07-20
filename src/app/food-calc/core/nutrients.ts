type NutrientsType = {
  carbs: number;
  protein: number;
  fat: number;
  vitamins: number;
};

export class Nutrients {
  carbs: number;
  protein: number;
  fat: number;
  vitamins: number;

  constructor(carbs: number, protein: number, fat: number, vitamins: number) {
    this.carbs = carbs;
    this.protein = protein;
    this.fat = fat;
    this.vitamins = vitamins;
  }

  nutrientTotal(): number {
    return Math.ceil((this.carbs + this.protein + this.fat + this.vitamins) * 100) / 100;
  }

  maxNutrientType(): keyof NutrientsType {
    const maxValue = Math.max(this.carbs, this.protein, this.fat, this.vitamins);
    if (maxValue === this.carbs) return 'carbs';
    if (maxValue === this.protein) return 'protein';
    if (maxValue === this.fat) return 'fat';
    if (maxValue === this.vitamins) return 'vitamins';
    return 'carbs';
  }

  minNutrientType(): keyof NutrientsType {
    const minValue = Math.min(this.carbs, this.protein, this.fat, this.vitamins);
    if (minValue === this.carbs) return 'carbs';
    if (minValue === this.protein) return 'protein';
    if (minValue === this.fat) return 'fat';
    if (minValue === this.vitamins) return 'vitamins';
    return 'carbs';
  }

  nutrientBalance(): number {
    const values = this.values();
    const max = Math.max(...values);
    const min = Math.min(...values);
    if (max <= 0) {
      return 1;
    }
    return min / max;
  }

  nutrientAvg(): number {
    return this.nutrientTotal() / 4;
  }

  maxNutrientValue(): number {
    return Math.max(this.carbs, this.protein, this.fat, this.vitamins);
  }

  values(): number[] {
    return [this.carbs, this.protein, this.fat, this.vitamins];
  }

  static properties(): Array<keyof NutrientsType> {
    return ['carbs', 'protein', 'fat', 'vitamins'];
  }

  static add(a: Nutrients, b: Nutrients): Nutrients {
    let result = new Nutrients(0, 0, 0, 0);
    this.properties().forEach((prop) => {
      result[prop] = a[prop] + b[prop];
    });
    return result;
  }

  static multiply(a: Nutrients, val: number): Nutrients {
    let result = new Nutrients(0, 0, 0, 0);
    this.properties().forEach((prop) => {
      result[prop] = a[prop] * val;
    });
    return result;
  }

  toString(pos: number = 7, showEmpty: boolean = false): string {
    return Nutrients.properties()
      .filter((prop) => showEmpty || this[prop] > 0)
      .map((prop) => `- ${prop}: ${this[prop].toFixed(pos)}`)
      .join('\n');
  }
}

// Utility functions
