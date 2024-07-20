import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { ItemsStore } from '../data/items';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  itemsStore = inject(ItemsStore);
  http = inject(HttpClient);

  load() {
    return this.http.get<Record<string, any>>('/api/v1/plugins/EcoCalculator/items').pipe(
      tap((items) => {
        this.itemsStore.setItems(
          Object.entries(items).map(([k, v]) => ({
            id: k,
            name: v.Name,
            tags: v.Tags,
            displayName: v.DisplayName,
          })),
        );
      }),
    );
  }
}
