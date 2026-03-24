import { booleanAttribute, computed, Directive, input } from '@angular/core';

import { cn } from '../cn';
import { button, type ButtonIntent, type ButtonShape, type ButtonSize } from './button.variants';

@Directive({
  selector: 'button[appButton], a[appButton]',
  host: { '[class]': 'hostClass()' },
})
export class ButtonDirective {
  readonly intent = input<ButtonIntent>('primary');
  readonly size = input<ButtonSize>('md');
  readonly shape = input<ButtonShape>('default');
  readonly active = input(false, { transform: booleanAttribute });
  readonly class = input('');

  protected readonly hostClass = computed(() =>
    cn(
      button({ intent: this.intent(), size: this.size(), shape: this.shape() }),
      this.active() && 'ring-2 ring-primary/50',
      this.class(),
    ),
  );
}
