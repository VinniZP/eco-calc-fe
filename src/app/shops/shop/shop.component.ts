import { Component, computed, input } from '@angular/core';
import { Shop } from '../../data/shops';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent {
  shop = input.required<Shop>();

  sellOffers = computed(() => this.shop().offers.filter((offer) => offer.buying));
  buyOffers = computed(() => this.shop().offers.filter((offer) => !offer.buying));
}
