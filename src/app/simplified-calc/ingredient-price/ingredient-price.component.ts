import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';
import { InputDirective } from '../../shared/ui';
import { UserConfigStore } from '../../data/config';
import { ShopsStore } from '../../data/shops';
import { ShopIconComponent } from '../../ui/shop-icon.component';
import { shopDialogManager } from '../shop-picker/dialog-manager';

@Component({
    selector: 'app-ingredient-price',
    imports: [ShopIconComponent, TippyDirective, InputDirective],
    templateUrl: './ingredient-price.component.html',
    styleUrl: './ingredient-price.component.scss'
})
export class IngredientPriceComponent {
  item = input.required<string>();
  updateStrategy = input(true);
  price = input(0);
  priceUpdated = output<number>();

  userConfigStore = inject(UserConfigStore);
  shopsStore = inject(ShopsStore);
  shopDialogManager = shopDialogManager();

  focused = signal(false);

  itemPrice = computed(() => {
    if (!this.updateStrategy()) {
      return this.price();
    }
    return this.userConfigStore.itemPrices()[this.item()] || 0;
  });

  hasShopPrice = computed(() => {
    return this.shopsStore.filterByItemName(this.item()).length > 0;
  });

  onFocus(input: HTMLInputElement) {
    this.focused.set(true);
    requestAnimationFrame(() => input.select());
  }

  onBlur(input: HTMLInputElement) {
    const raw = input.value.replace(',', '.').replace(/[^\d.]/g, '');
    const price = parseFloat(raw);
    if (!isNaN(price) && price >= 0) {
      if (this.updateStrategy()) {
        this.userConfigStore.updateItemPrice(this.item(), price);
      } else {
        this.priceUpdated.emit(price);
      }
    }
    this.focused.set(false);
  }

  openShopPicker() {
    this.shopDialogManager.open(this.item()).closed.subscribe((res) => {
      if (res) {
        if (this.updateStrategy()) {
          this.userConfigStore.updateItemPrice(this.item(), res as number);
        } else {
          this.priceUpdated.emit(res as number);
        }
      }
    });
  }
}
