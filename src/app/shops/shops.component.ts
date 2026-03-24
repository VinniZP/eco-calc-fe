import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ShopsStore } from '../data/shops';
import { InputDirective } from '../shared/ui';
import { ShopComponent } from './shop/shop.component';

@Component({
    selector: 'app-shops',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ShopComponent, FormsModule, InputDirective],
    templateUrl: './shops.component.html',
    styleUrl: './shops.component.scss'
})
export class ShopsComponent {
  shopsStore = inject(ShopsStore);
  search = signal('');

  shops = computed(() =>
    this.shopsStore
      .entities()
      .filter((shop) => shop.name.toLowerCase().includes(this.search().toLowerCase())),
  );
}
