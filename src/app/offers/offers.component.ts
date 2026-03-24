import { SlicePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ShopsStore } from '../data/shops';
import { InputDirective } from '../shared/ui/input/input.directive';
import { ToggleDirective } from '../shared/ui/toggle/toggle.directive';
import { OfferComponent } from './offer/offer.component';

@Component({
    selector: 'app-offers',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [OfferComponent, SlicePipe, InputDirective, ToggleDirective],
    templateUrl: './offers.component.html'
})
export class OffersComponent implements AfterViewInit {
  shopsStore = inject(ShopsStore);
  private destroyRef = inject(DestroyRef);
  search = signal('');

  onlyAvailable = signal(false);

  itemsToShow = signal(10);

  offerItems = computed(() =>
    Array.from(
      new Set(
        this.shopsStore
          .allOffers()
          .filter((offer) => (this.onlyAvailable() ? offer.quantity > 0 : true))
          .map((offer) => offer.itemName),
      ),
    ).sort((a, b) => a.localeCompare(b)),
  );

  filteredOfferItems = computed(() =>
    this.offerItems().filter((item) => item.toLowerCase().includes(this.search().toLowerCase())),
  );

  scrollTrigger = viewChild<ElementRef>('scrollTrigger');

  constructor() {
    effect(
      () => {
        this.search();
        this.onlyAvailable();
        this.itemsToShow.set(10);
      },
    );
  }

  ngAfterViewInit() {
    const el = this.scrollTrigger()?.nativeElement;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.intersectionRatio > 0)) {
        this.itemsToShow.update((value) => value + 10);
      }
    });

    observer.observe(el);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
