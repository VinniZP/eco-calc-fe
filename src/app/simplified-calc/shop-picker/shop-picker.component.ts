import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { of } from 'rxjs';
import { Shop, ShopsStore } from '../../data/shops';
import { DialogRef } from '../../shared/dialog.service';
import { ButtonDirective } from '../../shared/ui/button/button.directive';
import { DividerComponent } from '../../shared/ui/divider/divider.component';
import { TableDirective } from '../../shared/ui/table/table.directive';
import { StripTagsPipe } from '../../ui/strip-tags.pipe';

interface DialogData {
  product: string;
}

@Component({
    selector: 'app-shop-picker',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block bg-base-100 w-full h-full max-w-full rounded shadow-2xl max-h-[95vh] overflow-y-auto' },
    imports: [StripTagsPipe, ButtonDirective, DividerComponent, TableDirective],
    templateUrl: './shop-picker.component.html'
})
export class ShopPickerComponent {
  shopStore = inject(ShopsStore);

  dialogData = input.required<DialogData>();
  dialogRef = input.required<DialogRef<number | null>>();

  get data() { return this.dialogData(); }
  get ref() { return this.dialogRef(); }

  shops: Signal<Shop[]> = computed(() => {
    return this.shopStore
      .filterByItemName(this.data.product)
      .map((shop) => ({
        ...shop,
        minPrice: shop.offers.reduce((min, offer) => Math.min(min, +offer.price), Infinity),
      }))
      .sort((a, b) => a.minPrice - b.minPrice);
  });

  close() {
    this.ref.close(null);
  }

  pickPrice(price: number) {
    this.ref.close(price);
  }

  protected readonly of = of;
}
