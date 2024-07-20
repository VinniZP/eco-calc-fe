import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { Shop, ShopsStore } from '../data/shops';

@Injectable({
  providedIn: 'root',
})
export class ShopsService {
  shopsStore = inject(ShopsStore);
  http = inject(HttpClient);

  load() {
    return this.http.get<any[]>('/api/v1/plugins/EcoCalculator/shops').pipe(
      tap((response) => {
        var i = 0;
        const shops = response.map(
          (value) =>
            ({
              id: value.Name + value.Owner + i++,
              enabled: value.Enabled,
              name: value.Name,
              balance: value.Balance,
              currency: value.CurrencyName,
              owner: value.Owner,
              offers: value.Offers.map((offer: any) => ({
                minDurability: offer.MinDurability,
                maxNumberWanted: offer.MaxNumberWanted,
                limit: offer.Limit,
                price: offer.Price,
                quantity: offer.Quantity,
                category: offer.Category,
                itemName: offer.ItemName,
                buying: offer.Buying,
              })),
            }) satisfies Shop,
        );
        this.shopsStore.setShops(shops);
      }),
    );
  }
}
