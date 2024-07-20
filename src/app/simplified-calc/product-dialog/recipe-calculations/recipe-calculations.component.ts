import { DecimalPipe, JsonPipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  OnInit,
  output,
  runInInjectionContext,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TippyDirective } from '@ngneat/helipopper';
import { UserConfigStore } from '../../../data/config';
import { Recipe } from '../../../data/recipes';
import { IngredientPriceComponent } from '../../ingredient-price/ingredient-price.component';
import { ProductLinkComponent } from '../../product-link/product-link.component';

const levelMap: Record<number, number> = {
  1: 0.8,
  2: 0.75,
  3: 0.7,
  4: 0.65,
  5: 0.6,
  6: 0.55,
  7: 0.5,
};

const moduleReduce: Record<number, number> = {
  0: 1,
  1: 0.9,
  2: 0.75,
  3: 0.6,
  4: 0.55,
  5: 0.5,
};

const normalizeDecimal = (value: number) => {
  return parseFloat((Math.ceil(value * 100) / 100).toFixed(2));
};

@Component({
  selector: 'app-recipe-calculations',
  standalone: true,
  imports: [
    FormsModule,
    NgSelectModule,
    ProductLinkComponent,
    IngredientPriceComponent,
    DecimalPipe,
    TippyDirective,
    JsonPipe,
  ],
  templateUrl: './recipe-calculations.component.html',
  styleUrl: './recipe-calculations.component.scss',
})
export class RecipeCalculationsComponent implements OnInit {
  userConfigStore = inject(UserConfigStore);
  injector = inject(Injector);
  productName = input.required<string>();
  recipe = input.required<Recipe>();
  close = output<void>();
  craftAmount = signal(1);
  module = signal(0);
  level = signal(1);
  margin = signal(0);
  lavish = signal(false);
  priceOverride = signal<Record<string, { overrided: boolean; price: number } | undefined>>({});

  caloriesCount = computed(() => {
    return this.recipe().laborCost * this.craftAmount() * (levelMap[this.level()] || 1);
  });

  marginOptions = [0, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100];

  calculations = computed(() => {
    const recipe = this.recipe();
    const calories = this.caloriesCount();
    const margin = this.margin();
    const module = this.module();
    const lavish = this.lavish();
    const craftAmount = this.craftAmount();
    const itemPrices = this.userConfigStore.itemPrices();
    const caloryPrice = itemPrices['calories'] ?? 0;
    const priceOverrides = this.priceOverride();

    const ingredients = Object.assign(
      {},
      ...recipe.ingredients.map((ingredient) => {
        const moduleMult = ingredient.isStatic ? 1 : moduleReduce[module];
        const lavishMult = ingredient.isStatic ? 1 : lavish ? 0.95 : 1;
        let name = ingredient.name || ingredient.tag;
        const quantity = Math.ceil(ingredient.amount * craftAmount * moduleMult * lavishMult);
        const price = itemPrices[name] || 0;
        const totalPrice = quantity * price;
        return {
          [name]: {
            quantity,
            price: totalPrice / craftAmount,
            totalPrice,
          },
        };
      }),
    );

    const caloriesCost = (calories * caloryPrice) / 1000;

    let leftRecipeCost =
      Object.values(ingredients).reduce((acc: number, val: any) => acc + val.totalPrice, 0) /
        craftAmount +
      caloriesCost / craftAmount;

    const totalRecipeCost = leftRecipeCost;

    const products = Object.assign(
      {},
      ...recipe.products.map((product, i) => {
        const moduleMult = product.isStatic ? 1 : moduleReduce[module];
        const lavishMult = product.isStatic ? 1 : lavish ? 0.95 : 1;
        const quantity = Math.ceil(product.amount * moduleMult * lavishMult);
        let price = itemPrices[product.name] || 0;
        let isOverrided = false;
        if (priceOverrides[product.name]?.overrided) {
          price = priceOverrides[product.name]?.price ?? 0;
          isOverrided = true;
        }
        let isReturn = ingredients[product.name] != null && i !== 0;
        return {
          [product.name]: {
            quantity: quantity,
            price: isReturn || isOverrided ? price : 0,
            marginPrice: isReturn || isOverrided ? price : 0,
            isReturn: isReturn,
            isOverrided: isOverrided,
          },
        };
      }),
    );

    Object.values(products)
      .filter((v: any) => v.isReturn || v.isOverrided)
      .forEach((product: any) => {
        leftRecipeCost -= product.price * product.quantity;
      });

    const totalQuantity = Object.values(products)
      .filter((v: any) => !v.isReturn && !v.isOverrided)
      .reduce((acc: number, val: any) => acc + val.quantity, 0);

    Object.entries(products)
      .filter(([_, v]: any[]) => !v.isReturn && !v.isOverrided)
      .forEach(([k, v]: [string, any]) => {
        const craftPercent = v.quantity / totalQuantity;

        products[k].price = normalizeDecimal((leftRecipeCost * craftPercent) / v.quantity);
        products[k].marginPrice = normalizeDecimal(products[k].price * (1 + margin / 100));
      });

    return {
      totalRecipeCost,
      ingredients,
      products,
      caloriesCost: caloriesCost / craftAmount,
      totalCaloriesCost: caloriesCost,
    };
  });

  ngOnInit() {
    const settings = this.userConfigStore.getProductSettings(this.productName());
    if (settings) {
      this.craftAmount.set(settings.craftAmount);
      this.module.set(settings.module);
      this.margin.set(settings.margin);
      this.priceOverride.set(settings.priceOverride);
    }
    runInInjectionContext(this.injector, () => {
      effect(
        (onCleanup) => {
          const skillSettings = this.userConfigStore.getSkillSettings(
            untracked(this.recipe).skillNeeds?.[0]?.name ?? '',
          );
          untracked(() => {
            if (skillSettings) {
              if (this.level() !== skillSettings.level) {
                this.level.set(skillSettings.level);
              }
              if (this.lavish() !== skillSettings.lavish) {
                this.lavish.set(skillSettings.lavish);
              }
            }
          });
        },
        { allowSignalWrites: true },
      );
      effect(
        () => {
          let recipe2 = this.recipe();
          let level1 = this.level();
          let lavish1 = this.lavish();
          untracked(() => {
            this.userConfigStore.updateSkillSettings(recipe2.skillNeeds?.[0]?.name ?? '', {
              level: level1,
              lavish: lavish1,
            });
          });
        },
        { allowSignalWrites: true },
      );
      effect(
        () => {
          let productName1 = this.productName();
          let craftAmount1 = this.craftAmount();
          let module1 = this.module();
          let margin1 = this.margin();
          let priceOverride1 = this.priceOverride();
          let recipe1 = this.recipe();
          untracked(() => {
            this.userConfigStore.updateProductSettings(productName1, {
              craftAmount: craftAmount1,
              module: module1,
              margin: margin1,
              priceOverride: priceOverride1,
              skill: recipe1.skillNeeds?.[0]?.name ?? '',
              recipeName: recipe1.name,
            });
          });
        },
        {
          allowSignalWrites: true,
        },
      );
    });
  }

  editPrice(name: string) {
    this.priceOverride.update((v) => ({
      ...v,
      [name]: { overrided: true, price: this.calculations().products[name].price },
    }));
  }

  overridePrice(name: string, $event: number) {
    this.priceOverride.update((v) => ({
      ...v,
      [name]: { overrided: true, price: $event },
    }));
  }

  cancelOverride(name: string) {
    this.priceOverride.update((v) => {
      delete v[name];
      return { ...v };
    });
  }

  savePrices(name: string, close: boolean) {
    this.userConfigStore.updateItemPrice(name, this.calculations().products[name].price);
    this.userConfigStore.updateSellPrice(name, this.calculations().products[name].marginPrice);
    if (close) {
      this.close.emit();
    }
  }

  copy(name: string, price: string) {
    const el = document.createElement('textarea');
    el.value = (Math.ceil(this.calculations().products[name][price] * 100) / 100).toFixed(2);
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}
