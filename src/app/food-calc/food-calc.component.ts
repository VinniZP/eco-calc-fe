import { DecimalPipe, JsonPipe, NgClass, PercentPipe, SlicePipe } from '@angular/common';
import { Component, computed, effect, inject, signal, Signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgSelectModule } from '@ng-select/ng-select';
import { TippyDirective } from '@ngneat/helipopper';
import { createNotifier } from 'ngxtension/create-notifier';
import { debounceTime, startWith } from 'rxjs';
import { Food, FoodStore } from '../data/food';
import { ShopsStore } from '../data/shops';
import { StomachData, Testiness, UserStore } from '../data/user';
import { FoodService } from '../services/food.service';
import { UserService } from '../services/user.service';
import { DonutComponent } from '../ui/donut/donut.component';
import { FoodCalculator } from './core/calculator/calculator';
import { FoodSimulator } from './core/calculator/simulator';
import { FoodCalcConfig } from './core/config';
import { Nutrients } from './core/nutrients';
import { FoodItem, Stomach } from './core/stomach';
import { TestinessPipe } from './testiness.pipe';

@Component({
  selector: 'app-food-calc',
  standalone: true,
  imports: [
    FormsModule,
    JsonPipe,
    TestinessPipe,
    NgClass,
    DecimalPipe,
    DonutComponent,
    PercentPipe,
    SlicePipe,
    TippyDirective,
    ReactiveFormsModule,
    NgSelectModule,
  ],
  templateUrl: './food-calc.component.html',
  styleUrl: './food-calc.component.scss',
  providers: [Stomach],
})
export class FoodCalcComponent {
  userStore = inject(UserStore);
  foodStore = inject(FoodStore);
  shopsStore = inject(ShopsStore);
  stomach = inject(Stomach);
  foodService = inject(FoodService);

  config = new FormGroup({
    minTestiness: new FormControl(0.7, [
      Validators.required,
      Validators.pattern(/^\d*\.?\d{0,2}$/),
    ]),
    minCalories: new FormControl(100, [Validators.required, Validators.pattern(/^\d+$/)]),
    minNutrients: new FormControl(0, [Validators.required, Validators.pattern(/^\d+$/)]),
    availableInStore: new FormControl(true),
  });

  availableInStore = signal(true);
  userService = inject(UserService);

  stomachData: Signal<StomachData> = this.userStore.stomach;
  foodToCal = computed(() => {
    return Object.assign(
      {},
      ...this.foodStore.entities().map((f) => ({
        [f.name]: f.calories,
      })),
    );
  });
  unusedOffers = computed(() => {
    const customEated = this.customEatedList();
    const offers = this.shopsStore.allOffers();
    const availableItems = offers
      .filter((o) => !o.buying)
      .map((v) => {
        return {
          item: v.itemName,
          quantity: v.quantity,
        };
      })
      .reduce(
        (acc, v) => {
          acc[v.item] = (acc[v.item] || 0) + v.quantity;
          return acc;
        },
        {} as Record<string, number>,
      );
    customEated.forEach((e) => {
      availableItems[e.name] = (availableItems[e.name] || 0) - e.count;
    });
    return availableItems;
  });

  contentCalories = toSignal(
    toObservable(this.stomach.contentCaloriesList).pipe(debounceTime(100)),
    {
      initialValue: [],
    },
  );

  nextFood = toSignal(
    toObservable(this.stomach.calculatedNext).pipe(startWith([]), debounceTime(100)),
    {
      initialValue: [],
    },
  );

  nextToEat = computed(() => {
    const availableItems = this.unusedOffers();
    if (!this.availableInStore()) {
      return this.nextFood();
    }
    return this.nextFood().filter((v) => availableItems[v.name] > 0);
  });

  customEatedByShop = computed(() => {
    const customEatedList = this.customEatedList();
    if (customEatedList.length === 0) {
      return [];
    }
    return Object.entries(
      customEatedList.reduce(
        (acc, v) => {
          const shop =
            this.shopsStore
              .allOffers()
              .sort((a, b) => b.quantity - a.quantity)
              .find((o) => o.itemName === v.name && o.quantity > 0 && !o.buying)?.shop ||
            'Неизвестно';
          acc[shop] = (acc[shop] || []).concat([v]);
          return acc;
        },
        {} as Record<string, any>,
      ),
    ).map(([shop, data]) => ({ shop, data }));
  });

  stomachContent = toSignal(toObservable(this.stomach.content).pipe(debounceTime(100)), {
    initialValue: [],
  });

  costPer1000Calories = computed(() => {
    this.stomach.refresh.listen();
    const offers = this.shopsStore.allOffers();
    const content = this.stomachContent();

    const calc = content.reduce(
      (acc, food) => {
        const storeFood = offers.filter((o) => o.itemName === food && !o.buying);
        const avgPrice =
          storeFood.reduce((acc, o) => acc + parseFloat(o.price), 0) / storeFood.length || 0;
        acc.calories += this.stomach.foodToCalories.get(food) || 0;
        acc.cost += avgPrice;
        return acc;
      },
      { calories: 0, cost: 0 },
    );
    if (calc.calories === 0) {
      return 0;
    }
    return (calc.cost / calc.calories) * 1000;
  });

  reset$ = createNotifier();

  constructor() {
    this.foodService.load().subscribe();
    effect(
      () => {
        this.reset$.listen();
        let stomachData1 = this.stomachData();
        let entities = this.foodStore.entities();
        let tasteConfig = stomachData1.testiness;
        untracked(() => {
          this.setFood(entities, tasteConfig);
        });
      },
      {
        allowSignalWrites: true,
      },
    );
    effect(
      () => {
        this.reset$.listen();
        let stomachData1 = this.stomachData();
        untracked(() => {
          this.stomach.setContent(
            stomachData1.content
              // .slice(Math.floor(stomachData1.content.length - 1))
              .map((c) => c.name),
          );
        });
      },
      {
        allowSignalWrites: true,
      },
    );
    this.config.valueChanges
      .pipe(startWith(this.config.value), debounceTime(100), takeUntilDestroyed())
      .subscribe((value) => {
        if (!this.config.valid) return;
        if (value.minTestiness && !isNaN(+value.minTestiness)) {
          this.stomach.minTestiness.set(+value.minTestiness);
        }
        if (value.minCalories && !isNaN(+value.minCalories)) {
          this.stomach.minCalories.set(+value.minCalories);
        }
        if (value.minNutrients && !isNaN(+value.minNutrients)) {
          this.stomach.minNutrients.set(+value.minNutrients);
        }
        if (value.availableInStore != null) {
          this.availableInStore.set(value.availableInStore);
        }
      });
  }

  private setFood(entities: Food[], tasteConfig: Testiness[]) {
    this.stomach.setFood(
      entities
        // .filter((f) => availableItems.includes(f.name))
        .map(
          (f) =>
            new FoodItem(
              f.name,
              new Nutrients(
                f.nutrients.carbs,
                f.nutrients.protein,
                f.nutrients.fat,
                f.nutrients.vitamins,
              ),
              f.calories,
            ),
        ),
      tasteConfig,
    );
  }

  customEated = signal<Record<string, number>>({});

  customEatedList = computed(() => {
    return Object.entries(this.customEated()).map(([name, count]) => ({ name, count }));
  });

  eatCustom(item: { name: string; value: number }) {
    this.stomach.eat(item.name);
    this.customEated.update((e) => ({
      ...e,
      [item.name]: (e[item.name] || 0) + 1,
    }));
  }

  eatCalories(number: number) {
    const availableInStore = this.availableInStore();
    const currentCalories = this.stomach.totalCals();
    const eatAsync = () => {
      setTimeout(() => {
        if (!this.stomach.calculating()) {
          let food = this.stomach.calculatedNext().find((v) => {
            return (
              !availableInStore ||
              Object.entries(this.unusedOffers()).some(
                ([name, count]) => name === v.name && count > 0,
              )
            );
          })?.name;
          if (!food) {
            return;
          }
          this.stomach.eat(food);

          this.customEated.update((e) => ({
            ...e,
            [food]: (e[food] || 0) + 1,
          }));
        }
        if (this.stomach.totalCals() <= currentCalories + number) {
          eatAsync();
        }
      }, 20);
    };
    eatAsync();
  }

  eatVariety() {
    const availableInStore = this.availableInStore();
    const allowedFood = this.stomach.food
      .filter((f) => {
        //
        let satisfied =
          f.calories >= this.stomach.minCalories() &&
          f.nutrients.nutrientTotal() >= this.stomach.minNutrients() &&
          (this.stomach.foodToTaste.get(f.name) || 0) >= this.stomach.minTestiness();
        const needToEat = Math.ceil(
          FoodCalcConfig.minCaloriesToBeIncludedInVariertyBonus / f.calories,
        );
        return satisfied && (!availableInStore || this.unusedOffers()[f.name] >= needToEat);
      })
      .sort((a, b) => {
        // sort by taste then by calories
        return (
          b.nutrients.nutrientTotal() * (this.stomach.foodToTaste.get(b.name) || 0) -
          a.nutrients.nutrientTotal() * (this.stomach.foodToTaste.get(a.name) || 0)
        );
      });
    const eatAsync = () => {
      setTimeout(() => {
        if (!this.stomach.calculating()) {
          const food = allowedFood.filter(
            (v) =>
              (this.stomach.contentCalories()[v.name] || 0) <
              FoodCalcConfig.minCaloriesToBeIncludedInVariertyBonus,
          );
          if (!food.length) {
            return;
          }
          this.stomach.eat(food[0].name);

          this.customEated.update((e) => ({
            ...e,
            [food[0].name]: (e[food[0].name] || 0) + 1,
          }));
          if (
            food.length &&
            this.stomach.varietyMult() < FoodCalcConfig.varietyOutputLimit - 0.05
          ) {
            eatAsync();
          }
        } else {
          eatAsync();
        }
      }, 20);
    };
    eatAsync();
  }

  eatNutrition() {
    const allowedFood = this.stomach.food.filter((f) => {
      let satisfied =
        f.calories >= this.stomach.minCalories() &&
        f.nutrients.nutrientTotal() >= this.stomach.minNutrients() &&
        (this.stomach.foodToTaste.get(f.name) || 1) >= this.stomach.minTestiness();
      return satisfied && (!this.availableInStore() || this.unusedOffers()[f.name] > 0);
    });
    let executed = 0;
    const eatAsync = () => {
      setTimeout(() => {
        if (!this.stomach.calculating()) {
          const food = allowedFood
            .sort((a, b) => {
              const currentMaxNutrient = this.stomach.nutrients.minNutrientType();
              // sort by taste then by calories
              return (
                b.nutrients[currentMaxNutrient] * (this.stomach.foodToTaste.get(b.name) || 0) -
                b.nutrients[currentMaxNutrient] * (this.stomach.foodToTaste.get(a.name) || 0)
              );
            })
            .slice(0, 5)
            .sort((a, b) => {
              // sort by taste then by calories
              return (
                b.nutrients.nutrientAvg() * (this.stomach.foodToTaste.get(b.name) || 0) -
                b.nutrients.nutrientAvg() * (this.stomach.foodToTaste.get(a.name) || 0)
              );
            });
          if (!food.length) {
            return;
          }
          executed++;
          this.stomach.eat(food[0].name);

          this.customEated.update((e) => ({
            ...e,
            [food[0].name]: (e[food[0].name] || 0) + 1,
          }));
        }
        if (executed < 10) {
          eatAsync();
        }
      }, 20);
    };
    eatAsync();
  }

  copyByList() {
    const lines: string[] = [];
    this.customEatedByShop().forEach((e) => {
      lines.push(`\n${e.shop}`);
      e.data.forEach((d: any) => {
        lines.push(`${d.name} : ${d.count}`);
      });
    });
    navigator.clipboard.writeText(lines.join('\n').trim());
  }

  matSnackbarService = inject(MatSnackBar);
  reset() {
    this.userService.load().subscribe((res) => {
      this.customEated.set({});
      this.stomach.reset();
      this.stomach.refresh.notify();
      this.reset$.notify();

      this.matSnackbarService.open(
        res ? 'Данные обновлены, желудок очищен' : `Ваш желудок очищен`,
        undefined,
        {
          duration: 1000,
        },
      );
    });
  }

  eatBest(count = 5) {
    const calc = new FoodCalculator(
      this.stomach.food,
      this.stomachData().testiness,
      FoodCalcConfig,
    );
    this.stomach.content().forEach((c) => {
      calc.state.addFood(this.stomach.food.find((f) => f.name === c)!);
    });
    calc.calculate();

    const simulator = new FoodSimulator(
      calc.state,
      this.stomach.food,
      this.stomachData().testiness,
      FoodCalcConfig,
    );
    const availableFood = this.stomach.food.filter((f) => {
      let satisfied =
        f.calories >= this.stomach.minCalories() &&
        f.nutrients.nutrientTotal() >= this.stomach.minNutrients() &&
        (this.stomach.foodToTaste.get(f.name) || 0) >= this.stomach.minTestiness();
      return satisfied && (!this.availableInStore() || this.unusedOffers()[f.name] > 0);
    });
    const res = simulator.findBestFood(availableFood, count);

    const eatAsync = () => {
      setTimeout(() => {
        if (!this.stomach.calculating()) {
          const food = res.foodItems.pop();
          if (!food) {
            return;
          }
          this.stomach.eat(food.name);

          this.customEated.update((e) => ({
            ...e,
            [food.name]: (e[food.name] || 0) + 1,
          }));
          eatAsync();
        } else {
          eatAsync();
        }
      }, 30);
    };
    eatAsync();
  }
}
