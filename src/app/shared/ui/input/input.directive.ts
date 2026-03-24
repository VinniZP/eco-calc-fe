import { booleanAttribute, computed, Directive, input } from '@angular/core';

import { cn } from '../cn';
import { type InputSize, inputVariants } from './input.variants';

@Directive({
  selector: 'input[appInput], textarea[appInput]',
  host: { '[class]': 'hostClass()' },
})
export class InputDirective {
  readonly size = input<InputSize>('md');
  readonly bordered = input(true, { transform: booleanAttribute });
  readonly error = input(false, { transform: booleanAttribute });
  readonly class = input('');

  protected readonly hostClass = computed(() =>
    cn(
      inputVariants({
        size: this.size(),
        bordered: this.bordered(),
        error: this.error(),
      }),
      this.class(),
    ),
  );
}
