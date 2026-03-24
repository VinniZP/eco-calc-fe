import { booleanAttribute, computed, Directive, input } from '@angular/core';

import { cn } from '../cn';
import { type SelectSize, selectVariants } from './select.variants';

@Directive({
  selector: 'select[appSelect]',
  host: { '[class]': 'hostClass()' },
})
export class SelectDirective {
  readonly size = input<SelectSize>('md');
  readonly bordered = input(true, { transform: booleanAttribute });
  readonly class = input('');

  protected readonly hostClass = computed(() =>
    cn(
      selectVariants({
        size: this.size(),
        bordered: this.bordered(),
      }),
      this.class(),
    ),
  );
}
