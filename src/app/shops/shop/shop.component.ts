import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Shop } from '../../data/shops';
import { BadgeDirective } from '../../shared/ui/badge/badge.directive';
import { TableDirective } from '../../shared/ui/table/table.directive';
import { StripTagsPipe } from '../../ui/strip-tags.pipe';

@Component({
    selector: 'app-shop',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block rounded-lg border border-base-content/[0.06] bg-base-content/[0.02] overflow-hidden' },
    imports: [TableDirective, DecimalPipe, BadgeDirective, StripTagsPipe],
    templateUrl: './shop.component.html'
})
export class ShopComponent {
  shop = input.required<Shop>();

  sellOffers = computed(() => this.shop().offers.filter((offer) => !offer.buying));
  buyOffers = computed(() => this.shop().offers.filter((offer) => offer.buying));
}
