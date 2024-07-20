import { Component, computed, inject, input, output } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';
import { UserConfigStore } from '../../data/config';
import { ShopsStore } from '../../data/shops';
import { ShopIconComponent } from '../../ui/shop-icon.component';
import { shopDialogManager } from '../shop-picker/dialog-manager';

@Component({
  selector: 'app-ingredient-price',
  standalone: true,
  imports: [ShopIconComponent, TippyDirective],
  templateUrl: './ingredient-price.component.html',
  styleUrl: './ingredient-price.component.scss',
})
export class IngredientPriceComponent {
  item = input.required<string>();
  updateStrategy = input(true);
  price = input(0);
  priceUpdated = output<number>();

  userConfigStore = inject(UserConfigStore);
  shopsStore = inject(ShopsStore);
  shopDialogManager = shopDialogManager();

  itemPrice = computed(() => {
    if (!this.updateStrategy()) {
      return this.price();
    }
    return this.userConfigStore.itemPrices()[this.item()] || 0;
  });

  hasShopPrice = computed(() => {
    return this.shopsStore.filterByItemName(this.item()).length > 0;
  });

  handleChange($event: Event) {
    const target = $event.target as HTMLInputElement;
    const price = parseFloat(target.value.replace(',', '.').replace(/[^\d.]/g, ''));
    if (!isNaN(price)) {
      if (this.updateStrategy()) {
        this.userConfigStore.updateItemPrice(this.item(), price);
      } else {
        this.priceUpdated.emit(price);
      }
    }
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
