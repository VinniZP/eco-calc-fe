import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

export interface Ingredient {
  name: string;
  amount: number;
  isSpecificItem: boolean;
  isStatic: boolean;
  tag: string;
}

export interface Skill {
  name: string;
  level: number;
}

export interface Product {
  name: string;
  amount: number;
  isStatic: boolean;
}

export type Recipe = {
  id: string;
  displayName: string;
  name: string;
  laborCost: number;
  xpGain: number;
  craftingTime: number;
  skillNeeds: Skill[];
  craftingTable: string;
  ingredients: Ingredient[];
  products: Product[];
  product: Product;
};

export const RecipesStore = signalStore(
  { providedIn: 'root', protectedState: false },
  withEntities<Recipe>(),
  withComputed((store) => ({
    skills: computed(() => {
      return Array.from(new Set(store.entities().flatMap((v) => v.skillNeeds.map((s) => s.name))));
    }),
    tables: computed(() => {
      return Array.from(new Set(store.entities().flatMap((v) => v.craftingTable)));
    }),
    recipesByProduct: computed(() => {
      const recipes = store.entities();
      const result = new Map<string, Recipe[]>();
      recipes.forEach((recipe) => {
        recipe.products.forEach((product) => {
          const list = result.get(product.name) || [];
          list.push(recipe);
          result.set(product.name, list);
        });
      });
      // map to object
      const obj: { product: string; recipes: Recipe[] }[] = [];
      result.forEach((value, key) => {
        obj.push({ product: key, recipes: value });
      });
      return obj;
    }),
    ingredientInProduct: computed(() => {
      const recipes = store.entities();
      const result = new Map<string, Set<string>>();
      recipes.forEach((recipe) => {
        recipe.ingredients.forEach((ingredient) => {
          const list = result.get(ingredient.name) || new Set<string>();
          recipe.products.forEach((product) => {
            list.add(product.name);
          });
          result.set(ingredient.name, list);
        });
      });
      return Array.from(result.entries()).map(([key, value]) => ({
        ingredient: key,
        products: Array.from(value),
      }));
    }),
  })),
  withMethods((store) => {
    return {
      setRecipes(recipes: Recipe[]) {
        const recipesName = new Set();
        patchState(
          store,
          setAllEntities(
            recipes.map((recipe) => {
              if (recipesName.has(recipe.name)) {
                recipe.name = `${recipe.name} (${recipe.id})`;
              }
              recipesName.add(recipe.name);
              return { ...recipe };
            }),
          ),
        );
      },
      hasRecipeForProduct(product: string) {
        return store.recipesByProduct().findIndex((x) => x.product === product) !== -1;
      },
      getRecipesForProduct(product: string) {
        return store.recipesByProduct().find((x) => x.product === product)?.recipes || [];
      },
      usedInProducts(ingredient: string): string[] {
        return store.ingredientInProduct().find((x) => x.ingredient === ingredient)?.products || [];
      },
    };
  }),
);
