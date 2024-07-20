import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

export type Item = { id: string; name: string; displayName: string; tags: string[] };

export const ItemsStore = signalStore(
  { providedIn: 'root' },
  withEntities<Item>(),
  withMethods((store) => {
    return {
      setItems(items: Item[]) {
        patchState(store, setAllEntities(items));
      },
    };
  }),
);
