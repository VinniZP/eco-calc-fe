import { Component, computed, inject, input } from '@angular/core';
import { ShopsStore } from '../../data/shops';
import { TableDirective } from '../../shared/ui';
import { StripTagsPipe } from '../../ui/strip-tags.pipe';

@Component({
    selector: 'app-offer',
    host: { class: 'block border border-base-content/[0.08] bg-base-300 rounded-xl shadow-md shadow-black/15' },
    imports: [StripTagsPipe, TableDirective],
    templateUrl: './offer.component.html',
    styleUrl: './offer.component.scss'
})
export class OfferComponent {
  shopsStore = inject(ShopsStore);
  item = input.required<string>();
  onlyAvailable = input.required<boolean>();

  offers = computed(() =>
    this.shopsStore
      .allOffers()
      .filter(
        (offer) =>
          offer.itemName === this.item() && (this.onlyAvailable() ? offer.quantity > 0 : true),
      )
      .sort((a, b) => +a.price - +b.price),
  );

  sellingOffers = computed(() => this.offers().filter((offer) => !offer.buying));
  buyingOffers = computed(() => this.offers().filter((offer) => offer.buying));
}
