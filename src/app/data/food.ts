import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

export type Food = {
  id: string;
  name: string;
  tags: string[];
  calories: number;
  nutrients: {
    protein: number;
    carbs: number;
    fat: number;
    vitamins: number;
  };
};

export const FoodStore = signalStore(
  { providedIn: 'root' },
  withEntities<Food>(),
  withMethods((store) => {
    return {
      setItems(items: Food[]) {
        patchState(store, setAllEntities(items));
      },
    };
  }),
);
