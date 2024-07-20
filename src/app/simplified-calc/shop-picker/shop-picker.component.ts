import { DIALOG_DATA, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { Component, computed, inject, Signal } from '@angular/core';
import { of } from 'rxjs';
import { Shop, ShopsStore } from '../../data/shops';
import { StripTagsPipe } from '../../ui/strip-tags.pipe';

interface DialogData {
  product: string;
}

@Component({
  selector: 'app-shop-picker',
  standalone: true,
  imports: [StripTagsPipe],
  templateUrl: './shop-picker.component.html',
  styleUrl: './shop-picker.component.scss',
})
export class ShopPickerComponent {
  data = inject<DialogData>(DIALOG_DATA);
  shopStore = inject(ShopsStore);
  shops: Signal<Shop[]> = computed(() => {
    return this.shopStore
      .filterByItemName(this.data.product)
      .map((shop) => ({
        ...shop,
        minPrice: shop.offers.reduce((min, offer) => Math.min(min, +offer.price), Infinity),
      }))
      .sort((a, b) => a.minPrice - b.minPrice);
  });

  constructor(public ref: DialogRef<number | null, ShopPickerComponent>) {}

  close() {
    this.ref.close(null);
  }

  pickPrice(price: number) {
    this.ref.close(price);
  }

  static config(
    data: DialogData,
  ): Partial<DialogConfig<DialogData, DialogRef<number | null, ShopPickerComponent>>> {
    return {
      data,
      disableClose: true,
      width: '800px',
      maxWidth: 'calc(100vw - 32px)',
      id: 'shop-dialog-' + data.product,
    };
  }

  protected readonly of = of;
}
