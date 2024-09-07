import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

export type Item = { id: string; name: string; displayName: string; tags: string[] };

export const ItemsStore = signalStore(
  { providedIn: 'root', protectedState: false },
  withEntities<Item>(),
  withComputed((store) => ({
    tagsToItemNameMap: computed(() => {
      return store.entities().reduce(
        (acc, item) => {
          item.tags.forEach((tag) => {
            acc[tag] = acc[tag] || [];
            acc[tag].push(item.displayName);
          });
          return acc;
        },
        {} as Record<string, string[]>,
      );
    }),
  })),
  withMethods((store) => {
    return {
      setItems(items: Item[]) {
        patchState(store, setAllEntities(items));
      },
    };
  }),
);
