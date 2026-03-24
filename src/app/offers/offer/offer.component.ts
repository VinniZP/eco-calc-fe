import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ShopsStore } from '../../data/shops';
import { TableDirective } from '../../shared/ui';
import { StripTagsPipe } from '../../ui/strip-tags.pipe';

@Component({
    selector: 'app-offer',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block rounded-lg border border-base-content/[0.06] bg-base-content/[0.02] overflow-hidden' },
    imports: [StripTagsPipe, TableDirective, DecimalPipe],
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
