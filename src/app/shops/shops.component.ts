import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ShopsStore } from '../data/shops';
import { InputDirective } from '../shared/ui/input/input.directive';
import { ShopComponent } from './shop/shop.component';

@Component({
    selector: 'app-shops',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ShopComponent, InputDirective],
    templateUrl: './shops.component.html'
})
export class ShopsComponent {
  shopsStore = inject(ShopsStore);
  search = signal('');

  shops = computed(() =>
    this.shopsStore
      .entities()
      .filter((shop) => shop.name.toLowerCase().includes(this.search().toLowerCase())),
  );

  protected inputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
