import { SlicePipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { injectIsIntersecting } from 'ngxtension/inject-is-intersecting';
import { filter } from 'rxjs/operators';
import { ShopsStore } from '../data/shops';
import { OfferComponent } from './offer/offer.component';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [FormsModule, OfferComponent, SlicePipe],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.scss',
})
export class OffersComponent implements OnInit {
  shopsStore = inject(ShopsStore);
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
  private injector = inject(Injector);

  constructor() {
    effect(
      () => {
        this.search();
        this.onlyAvailable();
        this.itemsToShow.set(10);
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit() {
    const divInViewport$ = injectIsIntersecting({
      element: this.scrollTrigger()?.nativeElement,
      injector: this.injector,
    }).pipe(filter((x) => x.intersectionRatio > 0));

    // Only fetch data when the element is in the viewport
    divInViewport$.subscribe(() => {
      this.itemsToShow.update((value) => value + 10);
    });
  }
}
