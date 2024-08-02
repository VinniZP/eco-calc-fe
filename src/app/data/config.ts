import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';

export interface SelectedSkill {
  skill: string;
  level: number;
  lavish: boolean;
}

export interface ProductSettings {
  recipeName: string;
  craftAmount: number;
  skill: string;
  module: number;
  margin: number;
  priceOverride: Record<string, { overrided: boolean; price: number } | undefined>;
}

export interface SkillSettings {
  level: number;
  lavish: boolean;
}

type UserConfig = {
  selectedSkills: SelectedSkill[];
  enabledRecipes: string[];
  caloriesCost: number;
  margin: number;
  itemPrices: Record<string, number>;
  sellPrices: Record<string, number>;
  productSettings: Record<string, ProductSettings>;
  skillSettings: Record<string, SkillSettings>;
  tagOverrides: Record<string, string | null>;
};

export const UserConfigStore = signalStore(
  { providedIn: 'root' },
  withState<UserConfig>({
    selectedSkills: [],
    caloriesCost: 0,
    margin: 0,
    enabledRecipes: [],
    itemPrices: {},
    sellPrices: {},
    productSettings: {},
    skillSettings: {},
    tagOverrides: {},
  }),
  withMethods((state) => ({
    enableSkill(skill: string) {
      const found = state.selectedSkills().find((v) => v.skill === skill);
      if (!found) {
        patchState(state, {
          selectedSkills: [...state.selectedSkills(), { skill, level: 1, lavish: false }],
        });
      }
    },
    disableSkill(skill: string) {
      const found = state.selectedSkills().findIndex((v) => v.skill === skill);
      if (found != -1) {
        const selected = state.selectedSkills();
        selected.splice(found, 1);
        patchState(state, { selectedSkills: selected });
      }
    },
    updateSkillParams(skill: string, { level, lavish }: { level?: number; lavish?: boolean }) {
      const found = state.selectedSkills().find((v) => v.skill === skill);
      if (found) {
        const selected = state.selectedSkills();
        selected[selected.indexOf(found)] = {
          ...found,
          level: level ?? found.level,
          lavish: lavish ?? found.lavish,
        };
        patchState(state, { selectedSkills: selected });
      }
    },
    updateConfig({ caloriesCost, margin }: { caloriesCost: number; margin: number }) {
      patchState(state, { caloriesCost, margin });
    },
    enableRecipe(recipe: string) {
      patchState(state, { enabledRecipes: [...state.enabledRecipes(), recipe] });
    },
    disableRecipe(recipe: string) {
      const found = state.enabledRecipes().findIndex((v) => v === recipe);
      if (found != -1) {
        const enabled = state.enabledRecipes();
        enabled.splice(found, 1);
        patchState(state, { enabledRecipes: enabled });
      }
    },
    updateItemPrice(item: string, price: number) {
      patchState(state, { itemPrices: { ...state.itemPrices(), [item]: price } });
    },
    updateSellPrice(item: string, price: number) {
      patchState(state, { sellPrices: { ...state.sellPrices(), [item]: price } });
    },
    getItemPrices(product: number) {
      return {
        personal: state.itemPrices()[product] ?? 0,
        sell: state.sellPrices()[product] ?? 0,
      };
    },
    getProductSettings(product: string) {
      return state.productSettings()[product];
    },
    updateProductSettings(product: string, settings: ProductSettings) {
      patchState(state, { productSettings: { ...state.productSettings(), [product]: settings } });
    },
    getSkillSettings(skill: string) {
      return state.skillSettings()[skill];
    },
    updateSkillSettings(skill: string, settings: SkillSettings) {
      patchState(state, { skillSettings: { ...state.skillSettings(), [skill]: settings } });
    },
    updateTagOverride(tag: string, override: string | null) {
      patchState(state, { tagOverrides: { ...state.tagOverrides(), [tag]: override } });
    },
  })),
  withHooks({
    onInit(store) {},
    onDestroy(store) {},
  }),
);
