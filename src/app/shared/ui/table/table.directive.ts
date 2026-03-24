import { booleanAttribute, computed, Directive, input } from '@angular/core';

import { cn } from '../cn';
import { TABLE_BASE, type TableSize } from './table.variants';

@Directive({
  selector: 'table[appTable]',
  host: {
    '[class]': 'hostClass()',
    '[attr.data-zebra]': 'zebra() || null',
    '[attr.data-bordered]': 'bordered() || null',
    '[attr.data-size]': 'size()',
  },
})
export class TableDirective {
  readonly zebra = input(false, { transform: booleanAttribute });
  readonly bordered = input(false, { transform: booleanAttribute });
  readonly size = input<TableSize>('sm');
  readonly class = input('');

  protected readonly hostClass = computed(() =>
    cn(TABLE_BASE, this.class()),
  );
}
