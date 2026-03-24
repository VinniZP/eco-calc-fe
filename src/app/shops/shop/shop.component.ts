import { Component, computed, input } from '@angular/core';
import { Shop } from '../../data/shops';
import { TableDirective } from '../../shared/ui';

@Component({
    selector: 'app-shop',
    imports: [TableDirective],
    templateUrl: './shop.component.html',
    styleUrl: './shop.component.scss'
})
export class ShopComponent {
  shop = input.required<Shop>();

  sellOffers = computed(() => this.shop().offers.filter((offer) => offer.buying));
  buyOffers = computed(() => this.shop().offers.filter((offer) => !offer.buying));
}
