import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

export type ShopOffer = {
  minDurability: number;
  maxNumberWanted: number;
  limit: number;
  quantity: number;
  price: string;
  category: string;
  itemName: string;
  buying: boolean;
};

export type Shop = {
  id: string;
  name: string;
  balance: string;
  currency: string;
  enabled: boolean;
  owner: string;
  offers: ShopOffer[];
};

export const ShopsStore = signalStore(
  { providedIn: 'root', protectedState: false },
  withEntities<Shop>(),
  withMethods((store) => {
    return {
      setShops(items: Shop[]) {
        patchState(store, setAllEntities(items));
      },
      filterByOwner(owner: string): Shop[] {
        return store.entities().filter((shop) => shop.owner === owner);
      },
      allOffers(): (ShopOffer & { shop: string })[] {
        return store
          .entities()
          .reduce(
            (acc, shop) => acc.concat(shop.offers.map((v) => ({ ...v, shop: shop.name }))),
            [] as (ShopOffer & { shop: string })[],
          );
      },

      filterByItemName(itemName: string): Shop[] {
        return store
          .entities()
          .filter((shop) => shop.offers.some((offer) => offer.itemName === itemName))
          .map((shop) => {
            return {
              ...shop,
              offers: shop.offers.filter((offer) => offer.itemName === itemName),
            };
          });
      },
    };
  }),
);
